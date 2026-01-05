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
import Header from "../components/Header";

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
                        Authorization: `Bearer ${token}`
                    }
                }); const contentType = res.headers.get('content-type') || '';
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
            // Check strictly for undefined, allow empty string (proxy)
            if (BACKEND === undefined) {
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
                headers: { "Content-Type": "application/json" },
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
                Authorization: `Bearer ${token}`
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
                Authorization: `Bearer ${token}`
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
                        Authorization: `Bearer ${token}`
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
        <div className="min-h-screen bg-[#F9F8E9] font-afacad text-black pb-32">
            <div id="confetti-root"></div>
            <ToastManager />
            <Header />

            <div className="max-w-7xl mx-auto pt-28 px-4 sm:px-6 lg:px-8">

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div>
                        <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter">
                            My <span className="text-[#016766]">Wallet</span>
                        </h1>
                        <p className="text-xl font-bold text-gray-500 uppercase tracking-widest mt-2 ml-1">
                            Safe & Fast Digital Payments
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-black uppercase text-xs tracking-widest">
                            System: {backendConnected ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Side: Balance & Quick Actions */}
                    <div className="lg:col-span-5 flex flex-col gap-8">

                        {/* Balance Card */}
                        <div className="bg-black text-white p-8 rounded-[40px] border-4 border-[#016766] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#016766] rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative z-10">
                                <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Available Balance</div>
                                <div className="text-6xl lg:text-7xl font-black italic tracking-tighter mb-8 tabular-nums">
                                    ₹{balance?.toFixed(2)}
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => setRechargeOpen(true)}
                                        className="bg-[#016766] text-white px-8 py-4 rounded-2xl font-black uppercase italic border-2 border-white/20 hover:bg-[#015554] active:scale-95 transition-all shadow-xl"
                                    >
                                        + Recharge
                                    </button>
                                    <button
                                        onClick={() => setPinOpen(true)}
                                        className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase border-2 border-white/20 hover:bg-white/20 active:scale-95 transition-all"
                                    >
                                        {walletPin ? 'Update PIN' : 'Set PIN'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Low Balance Alert */}
                        {balance < 50 && (
                            <div className="bg-orange-50 p-6 rounded-3xl border-4 border-black border-dashed flex items-center gap-6 animate-in slide-in-from-left duration-500">
                                <span className="text-4xl">⚠️</span>
                                <div>
                                    <h3 className="font-black uppercase text-lg">Low Balance</h3>
                                    <p className="font-bold text-gray-600 text-sm">Add funds for frictionless ride starts.</p>
                                </div>
                            </div>
                        )}

                        {/* Settings Card */}
                        <div className="bg-white p-6 lg:p-10 rounded-[40px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic">Wallet Settings</h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-black">
                                    <div>
                                        <div className="font-black uppercase text-sm">Auto Recharge</div>
                                        <div className="text-xs font-bold text-gray-500">Auto-topup when low</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={autoRecharge}
                                        onChange={(e) => {
                                            const val = e.target.checked;
                                            setAutoRecharge(val);
                                            updateSettings(val, threshold);
                                        }}
                                        className="w-10 h-10 accent-[#016766] cursor-pointer"
                                    />
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-black">
                                    <div className="flex justify-between mb-2">
                                        <div className="font-black uppercase text-sm">Low Alert Threshold</div>
                                        <div className="font-black text-[#016766]">₹{threshold}</div>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="200"
                                        step="10"
                                        value={threshold}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setThreshold(val);
                                            updateSettings(autoRecharge, val);
                                        }}
                                        className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Transactions */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-6 lg:p-10 rounded-[40px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(1,103,102,1)] h-full overflow-hidden flex flex-col">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic flex items-center gap-3">
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm">📜</div>
                                Activity Feed
                            </h3>

                            <div className="flex-1 overflow-y-auto">
                                <TransactionList
                                    transactions={filteredTransactions}
                                    onSync={() => pushNotification("info", "Syncing transactions...")}
                                    onExport={() => pushNotification("success", "Export started")}
                                    onSearch={setQ}
                                    onFilter={setFilter}
                                    filter={filter}
                                    q={q}
                                />
                            </div>
                        </div>
                    </div>
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
                title="System Notifications"
                contentClassName="bg-white border-4 border-black rounded-3xl"
            >
                <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                    {notifications.length === 0 && (
                        <div className="text-center py-10">
                            <div className="text-4xl mb-4">🔔</div>
                            <p className="font-black uppercase text-gray-400">All caught up!</p>
                        </div>
                    )}
                    {notifications.map((n) => (
                        <div key={n.id} className={`p-4 rounded-2xl border-2 border-black flex flex-col gap-1 ${n.type === 'success' ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <p className="font-black uppercase text-sm italic">{n.text}</p>
                            <p className="text-[10px] font-bold text-gray-400">{n.time}</p>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
