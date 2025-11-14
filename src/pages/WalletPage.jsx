import { Card, CardBody, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import React, { useEffect, useRef, useState } from "react";
import Header from "../components/wallet/Header";
import WalletBalance from "../components/wallet/WalletBalance";
import TransactionList from "../components/wallet/TransactionList";
import RechargeModal from "../components/wallet/RechargeModal";
import PinModal from "../components/wallet/PinModal";
import Modal from "../components/ui/Modal.jsx";

import { useAuth } from "../context/AuthContext";

const BACKEND = import.meta.env.VITE_BACKEND_URL;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

function fireConfetti() {
    const root = document.querySelector("#confetti-root");
    if (!root) return;
    const wrap = document.createElement("div");
    wrap.className = "confetti-wrap pointer-events-none fixed inset-0 z-[9999]";
    for (let i = 0; i < 20; i++) {
        const span = document.createElement("span");
        span.style.position = "absolute";
        span.style.left = `${Math.random() * 100}%`;
        span.style.top = `${Math.random() * 10}%`;
        span.style.width = "8px";
        span.style.height = "14px";
        span.style.background = `hsl(${Math.random() * 360} 70% 60%)`;
        span.style.transform = `rotate(${Math.random() * 360}deg)`;
        span.style.opacity = "0.95";
        span.style.transition = "transform 1.8s linear, top 1.8s linear, opacity 1.8s";
        wrap.appendChild(span);
        setTimeout(() => {
            span.style.top = `${100 + Math.random() * 20}%`;
            span.style.transform += " translateY(100vh) rotate(360deg)";
            span.style.opacity = "0";
        }, 20);
    }
    root.appendChild(wrap);
    setTimeout(() => wrap.remove(), 2000);
}

export default function WalletPage() {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (!user) return;
        async function fetchWallet() {
            try {
                const res = await fetch(`${BACKEND}/api/wallet/${user._id}`);
                if (res.ok) {
                    const data = await res.json();
                    setBalance(data.balance);
                    setTransactions(data.transactions || []);
                }
            } catch (err) {
                console.error("Failed to fetch wallet data:", err);
            }
        }
        fetchWallet();
    }, [user]);

    const [rechargeOpen, setRechargeOpen] = useState(false);
    const [autoRecharge, setAutoRecharge] = useState(true);
    const [threshold, setThreshold] = useState(50);
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [walletPin, setWalletPin] = useState("");
    const [pinOpen, setPinOpen] = useState(false);
    const pendingActionRef = useRef(null);

    function pushNotification(type, text) {
        setNotifications((s) => [{ id: Date.now(), type, text, time: new Date().toLocaleString() }, ...s].slice(0, 50));
    }

    async function createOrderOnBackend(amount) {
        const url = `${BACKEND}/api/payments/create-order`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
        });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Create order failed: ${res.status} ${txt}`);
        }
        return res.json();
    }
    
    async function verifyPaymentOnBackend(payload, amount) {
        const url = `${BACKEND}/api/payments/verify`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, userId, amount }),
        });
        return res.json();
    }

    async function handleConfirmRecharge(amount) {
        const doFlow = async () => {
            try {
                pushNotification("info", `Creating order for ₹${amount}`);
                const order = await createOrderOnBackend(amount);

                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency || "INR",
                    name: "Bicycle Wallet",
                    description: `Recharge ₹${amount}`,
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            const verify = await verifyPaymentOnBackend(response, amount);
                            if (verify && verify.success) {
                                setBalance(verify.wallet.balance);
                                setTransactions(verify.wallet.transactions);
                                pushNotification("success", `Recharge ₹${amount} successful`);
                                fireConfetti();
                            } else {
                                pushNotification("warning", "Payment verification failed");
                                alert("Payment verification failed");
                            }
                        } catch (err) {
                            console.error("Verify error:", err);
                            alert("Verification error. Check backend logs.");
                        }
                    },
                    prefill: {
                        name: "Test User",
                        email: "test@example.com",
                        contact: "",
                    },
                    theme: { color: "#22c55e" }, // Changed theme to a green shade
                };

                if (typeof window.Razorpay === "undefined") {
                    alert("Razorpay SDK not loaded. Make sure the script is added to index.html");
                    return;
                }
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err) {
                console.error("Recharge flow error:", err);
                alert("Could not start payment: " + (err.message || err));
            }
        };

        if (walletPin) {
            pendingActionRef.current = doFlow;
            setPinOpen(true);
        } else {
            doFlow();
        }
    }

    function handlePinSubmit(pinInput) {
        if (!walletPin) {
            if (pinInput.length < 4) {
                alert("Choose a 4-digit PIN");
                return;
            }
            setWalletPin(pinInput);
            setPinOpen(false);
            pushNotification("success", "Wallet PIN set");
            const cb = pendingActionRef.current;
            if (typeof cb === "function") {
                cb();
                pendingActionRef.current = null;
            }
            return;
        }
        if (pinInput === walletPin) {
            setPinOpen(false);
            const cb = pendingActionRef.current;
            if (typeof cb === "function") {
                cb();
                pendingActionRef.current = null;
            }
        } else {
            alert("Incorrect PIN");
        }
    }

    useEffect(() => {
        if (autoRecharge && balance < threshold) {
            pushNotification("info", `Auto-recharge triggered: threshold ${threshold}`);
        }
    }, [balance, threshold, autoRecharge]);

    const [filter, setFilter] = useState("all");
    const [q, setQ] = useState("");
    const filteredTransactions = transactions.filter((tx) => {
        if (filter === "recharge" && tx.type !== "Recharge" && tx.type !== "Cashback") return false;
        if (filter === "ride" && (tx.type === "Recharge" || tx.type === "Cashback")) return false;
        if (q && !(JSON.stringify(tx).toLowerCase().includes(q.toLowerCase()))) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div id="confetti-root"></div>
            <Header 
                userName={user?.name} 
                onNotificationClick={() => setNotifOpen(true)} 
                onProfileClick={() => alert("Profile page not implemented")} 
            />
            <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <section className="lg:col-span-1 space-y-4">
                    <WalletBalance 
                        balance={balance} 
                        threshold={threshold} 
                        onRechargeClick={() => setRechargeOpen(true)} 
                        autoRecharge={autoRecharge} 
                        onAutoRechargeChange={setAutoRecharge} 
                        onThresholdChange={setThreshold} 
                    />
                    <Card>
                        <CardBody className="p-3">
                            <p className="text-sm font-medium">Saved payment method</p>
                            <p className="text-xs text-gray-500 mt-1">Not saved</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="p-3">
                            <p className="text-sm font-medium">Quick Alerts</p>
                            <ul className="text-xs text-gray-600 mt-2 space-y-1">
                                <li>Low balance alerts</li>
                                <li>Recharge success/failure</li>
                                <li>Ride deduction notifications</li>
                            </ul>
                        </CardBody>
                    </Card>

                </section>
                <TransactionList 
                    transactions={filteredTransactions} 
                    onSync={() => pushNotification("info", "Sync started")} 
                    onExport={() => pushNotification("success", "Exported transactions.csv")} 
                    onSearch={setQ} 
                    onFilter={setFilter} 
                    filter={filter} 
                    q={q} 
                />
            </main>
            <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-auto sm:hidden">
                <div className="bg-white rounded-full shadow px-4 py-2 flex gap-3">
                    <button className="text-center text-xs">🏠<div>Home</div></button>
                    <button className="text-center text-xs">🚲<div>Rides</div></button>
                    <button className="text-center text-xs text-green-600">💰<div>Wallet</div></button>
                    <button className="text-center text-xs">👤<div>Profile</div></button>
                </div>
            </div>
            <Modal open={notifOpen} onClose={() => setNotifOpen(false)} title={`Notifications (${notifications.length})`} footer={<div className="text-right text-xs text-gray-500">Auto cleared after 7 days</div>}>
                <div className="space-y-2">
                    {notifications.length === 0 && <p className="text-sm text-gray-500">No notifications</p>}
                    {notifications.map((n) => (
                        <div key={n.id} className="p-3 rounded-md bg-gray-50 flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium">{n.type === "success" ? "✅" : n.type === "warning" ? "⚠️" : "ℹ️"} {n.text}</p>
                                <p className="text-xs text-gray-400">{n.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
            <RechargeModal 
                open={rechargeOpen} 
                onClose={() => setRechargeOpen(false)} 
                onConfirm={handleConfirmRecharge} 
            />
            <PinModal 
                open={pinOpen} 
                onClose={() => setPinOpen(false)} 
                onPinSubmit={handlePinSubmit} 
                walletPin={walletPin} 
            />
        </div>
    );
}
 );
}
