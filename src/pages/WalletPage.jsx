import { Card, CardBody } from '../ui/card.jsx';
import React, { useEffect, useRef, useState } from "react";

import WalletBalance from "../components/wallet/WalletBalance";
import TransactionList from "../components/wallet/TransactionList";
import RechargeModal from "../components/wallet/RechargeModal";
import PinModal from "../components/wallet/PinModal";
import Modal from "../ui/Modal.jsx";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../components/Contexts/authContext";
import ToastManager, { notify } from "../ui/toastManager";
import WalletHeader from "../components/wallet/Header";

const BACKEND = import.meta.env.VITE_API_BASE_URL;
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
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (!user) return;
        async function fetchWallet() {
            try {
                const res = await fetch(`${BACKEND}/api/wallet/${user._id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const contentType = res.headers.get('content-type') || '';
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(`Wallet fetch failed: ${res.status} ${txt}`);
                }
                if (!contentType.includes('application/json')) {
                    const txt = await res.text();
                    throw new Error(`Expected JSON but received: ${txt.slice(0, 200)}`);
                }
                const data = await res.json();
                setBalance(data.balance);
                setTransactions(data.transactions || []);
                setAutoRecharge(data.autoRecharge ?? true);
                setThreshold(data.lowBalanceThreshold ?? 50);
                setWalletPin(data.pin || "");
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

    // Backend connectivity state
    const [backendConnected, setBackendConnected] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function checkBackend() {
            if (!BACKEND) {
                setBackendConnected(false);
                return;
            }
            try {
                const res = await fetch(`${BACKEND}/api/health`).catch(() => null);
                if (!cancelled) setBackendConnected(Boolean(res && res.ok));
            } catch (err) {
                if (!cancelled) setBackendConnected(false);
            }
        }
        checkBackend();
    }, []);

    async function updateSettings(ar, ts) {
        if (!user) return;
        try {
            await fetch(`${BACKEND}/api/wallet/${user._id}/settings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ autoRecharge: ar, lowBalanceThreshold: ts }),
            });
        } catch (err) {
            console.error("Failed to update settings:", err);
        }
    }

    function pushNotification(type, text) {
        setNotifications((s) => [{ id: Date.now(), type, text, time: new Date().toLocaleString() }, ...s].slice(0, 50));
    }

    async function createOrderOnBackend(amount) {
        const url = `${BACKEND}/api/payments/create-order`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ amount }),
        });
        if (!res.ok) {
            const txt = await res.text();
            console.error("createOrderOnBackend response not ok:", res.status, txt);
            throw new Error(`Create order failed: ${res.status} ${txt}`);
        }
        return res.json();
    }

    async function verifyPaymentOnBackend(payload, amount) {
        const url = `${BACKEND}/api/payments/verify`;
        const userId = user?._id || user?.id;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                razorpay_order_id: payload.razorpay_order_id,
                razorpay_payment_id: payload.razorpay_payment_id,
                razorpay_signature: payload.razorpay_signature,
                userId,
                amount
            }),
        });
        return res.json();
    }

    async function handleConfirmRecharge(amount) {
        const doFlow = async () => {
            try {
                pushNotification("info", `Creating order for ₹${amount}`);
                const order = await createOrderOnBackend(amount);
                console.log("ORDER CREATED:", order);

                const orderData = order.order || order; // Handle both wrapped and unwrapped

                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount: Number(orderData.amount), // Force absolute number (paise)
                    currency: String(orderData.currency || "INR"), // Force absolute string
                    name: "Bicycle Wallet",
                    description: `Recharge ₹${amount}`,
                    order_id: String(orderData.id),
                    handler: async function (response) {
                        try {
                            console.log("Razorpay Success Response:", response);
                            const verifyData = {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            };
                            const verify = await verifyPaymentOnBackend(verifyData, amount);
                            if (verify && verify.success) {
                                setBalance(verify.wallet.balance);
                                setTransactions(verify.wallet.transactions);
                                pushNotification("success", `Recharge ₹${amount} successful`);
                                notify.success(`Recharge ₹${amount} successful`);
                                fireConfetti();
                                setRechargeOpen(false);
                            } else {
                                pushNotification("warning", "Payment verification failed");
                                notify.error("Payment verification failed");
                            }
                        } catch (err) {
                            console.error("Verify error:", err);
                            notify.error("Verification error. Check backend logs.");
                            pushNotification("error", `Verification error: ${err.message}`);
                        }
                    },
                    prefill: {
                        name: user?.userName || "User",
                        email: user?.email || "user@example.com",
                        contact: user?.phone?.replace(/\D/g, '') || "6374410000", // Sanitize phone
                    },
                    theme: { color: "#016766" },
                };

                if (RAZORPAY_KEY_ID?.startsWith('rzp_test') && orderData.id?.startsWith('order_')) {
                    console.warn("⚠️ Mode Mismatch: Using TEST Key with a generated Order. Ensure both are LIVE.");
                }

                console.log("Initializing Razorpay with options:", options);
                if (typeof window.Razorpay === "undefined") {
                    alert("Razorpay SDK not loaded. Make sure the script is added to index.html");
                    return;
                }
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err) {
                console.error("Recharge flow error:", err);
                notify.error("Could not start payment: " + (err.message || err));
                pushNotification("error", `Recharge failed: ${err.message}`);
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

    async function handlePinSubmit(pinInput) {
        if (!walletPin) {
            if (pinInput.length < 4) {
                alert("Choose a 4-digit PIN");
                return;
            }
            setWalletPin(pinInput);
            setPinOpen(false);
            try {
                await fetch(`${BACKEND}/api/wallet/${user._id}/pin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ pin: pinInput }),
                });
                pushNotification("success", "Wallet PIN set and saved");
            } catch (err) {
                console.error("Failed to save PIN:", err);
            }
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

    const [filter, setFilter] = useState("all");
    const [q, setQ] = useState("");
    const filteredTransactions = transactions.filter((tx) => {
        if (filter === "recharge" && tx.type !== "Recharge" && tx.type !== "Cashback") return false;
        if (filter === "ride" && tx.type !== "Ride Charge") return false;
        if (filter === "earnings" && tx.type !== "Earnings") return false;
        if (q && !(JSON.stringify(tx).toLowerCase().includes(q.toLowerCase()))) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#F9F8E9] font-afacad text-black">
            <div id="confetti-root"></div>


            <ToastManager />

            <WalletHeader
                userName={user?.userName}
                onNotificationClick={() => setNotifOpen(true)}
                onProfileClick={() => navigate('/profile')}
            />

            <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
                <button onClick={() => navigate('/home')} className="px-6 py-2 rounded-xl border-2 border-black bg-white text-black font-bold hover:bg-gray-50 transition-colors">
                    ← Back to Home
                </button>

                {/* Backend Indicator */}
                <div className="flex items-center gap-2 text-sm font-medium bg-white px-3 py-1 rounded-full border border-gray-300">
                    <div className={`w-3 h-3 rounded-full ${backendConnected === null ? 'bg-yellow-400' : backendConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-600">{backendConnected === null ? 'Checking...' : backendConnected ? 'Online' : 'Offline'}</span>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-24 lg:pb-6">

                {/* Left Column: Balance Card */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <WalletBalance
                        balance={balance}
                        threshold={threshold}
                        onRechargeClick={() => setRechargeOpen(true)}
                        autoRecharge={autoRecharge}
                        onAutoRechargeChange={(val) => {
                            setAutoRecharge(val);
                            updateSettings(val, threshold);
                        }}
                        onThresholdChange={(val) => {
                            setThreshold(val);
                            updateSettings(autoRecharge, val);
                        }}
                        onSetPin={() => setPinOpen(true)}
                    />

                    {balance < 50 && (
                        <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-bold text-red-700">Low Balance Warning</p>
                                <p className="text-sm text-red-600 font-medium">Please top up at least ₹50 for seamless rides.</p>
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#016766] text-white rounded-xl p-4 border-2 border-black shadow-sm">
                            <p className="text-lg font-semibold opacity-90">Saved Method</p>
                            <p className="text-sm mt-1 opacity-75">No card saved</p>
                        </div>
                        <div className="bg-white text-black rounded-xl p-4 border-2 border-black shadow-sm">
                            <p className="text-lg font-semibold text-[#016766]">Quick Alerts</p>
                            <p className="text-sm mt-1 text-gray-600">Low balance • Rides</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Transactions */}
                <div className="lg:col-span-7 h-full">
                    <div className="rounded-2xl border-2 border-gray-300 p-4 lg:p-6 h-full min-h-[500px]">
                        <TransactionList
                            transactions={filteredTransactions}
                            onSync={() => pushNotification("info", "Sync started")}
                            onExport={() => pushNotification("success", "Exported transactions.csv")}
                            onSearch={setQ}
                            onFilter={setFilter}
                            filter={filter}
                            q={q}
                        />
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-auto z-50">
                <div className="bg-black text-white rounded-full shadow-xl px-6 py-3 flex gap-6 border-2 border-[#016766]">
                    <NavLink to="/home" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-[#016766]' : 'text-white'}`}>
                        <span className="text-xl">🏠</span>
                    </NavLink>
                    <NavLink to="/wallet" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-[#016766]' : 'text-white'}`}>
                        <span className="text-xl">💰</span>
                    </NavLink>
                </div>
            </div>

            {/* Modals */}
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
            <Modal
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
                title="Notifications"
                contentClassName="bg-white text-black border-2 border-black rounded-xl"
            >
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 && <p className="text-center text-gray-500 py-4">No new notifications</p>}
                    {notifications.map((n) => (
                        <div key={n.id} className={`p-3 rounded-lg border ${n.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            <p className="text-sm font-bold">{n.text}</p>
                            <p className="text-xs text-gray-500">{n.time}</p>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
