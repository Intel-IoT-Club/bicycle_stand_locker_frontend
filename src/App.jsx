import React, { useEffect, useRef, useState } from "react";
import bicycleIcon from './assets/icon.png';

const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://bicycle-locker.vercel.app";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RFY2rpzcInVgE8";
const userId = "KeerthiVasan";

function Card({ className = "", children }) {
    return <div className={`bg-white rounded-2xl shadow ${className}`}>{children}</div>;
}
function CardBody({ className = "p-4", children }) {
    return <div className={className}>{children}</div>;
}
function Button({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 ${className}`}
        >
            {children}
        </button>
    );
}
function OutlineButton({ children, className = "", ...props }) {
    return (
        <button {...props} className={`px-3 py-2 rounded-lg border bg-white ${className}`}>
            {children}
        </button>
    );
}
function Input({ className = "", ...props }) {
    return <input {...props} className={`border rounded-md px-3 py-2 outline-none ${className}`} />;
}
function Toggle({ checked, onChange }) {
    return (
        <label className="inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${checked ? "bg-green-600" : "bg-gray-300"} relative`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transform ${checked ? "translate-x-5" : ""} transition`} />
            </div>
        </label>
    );
}
function Modal({ open, onClose, title, footer, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full sm:w-[560px] bg-white rounded-t-xl sm:rounded-xl shadow-lg overflow-hidden mx-4">
                {title && <div className="p-4 border-b"><h3 className="text-lg font-semibold">{title}</h3></div>}
                <div className="p-4 max-h-[70vh] overflow-auto">{children}</div>
                {footer && <div className="p-4 border-t">{footer}</div>}
            </div>
        </div>
    );
}
function downloadCSV(filename, rows) {
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

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

export default function App() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        async function fetchWallet() {
            try {
                const res = await fetch(`${BACKEND}/api/wallet/${userId}`);
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
    }, []);

    const [rechargeOpen, setRechargeOpen] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [saveMethod, setSaveMethod] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [autoRecharge, setAutoRecharge] = useState(true);
    const [threshold, setThreshold] = useState(50);
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [walletPin, setWalletPin] = useState("");
    const [pinOpen, setPinOpen] = useState(false);
    const [pinInput, setPinInput] = useState("");
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

    async function handleConfirmRecharge() {
        const amount = selectedAmount || Number(customAmount || 0);
        if (!amount || amount <= 0) {
            alert("Enter a valid amount.");
            return;
        }

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

    function handlePinSubmit() {
        if (!walletPin) {
            if (pinInput.length < 4) {
                alert("Choose a 4-digit PIN");
                return;
            }
            setWalletPin(pinInput);
            setPinInput("");
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
            setPinInput("");
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
    const filtered = transactions.filter((tx) => {
        if (filter === "recharge" && tx.type !== "Recharge" && tx.type !== "Cashback") return false;
        if (filter === "ride" && (tx.type === "Recharge" || tx.type === "Cashback")) return false;
        if (q && !(JSON.stringify(tx).toLowerCase().includes(q.toLowerCase()))) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div id="confetti-root"></div>
            <div className="max-w-5xl mx-auto p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white-600 text-white p-4 rounded-md font-bold">
                        <img src={bicycleIcon} alt="Bicycle Icon" className="w-20 h-20" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Hello, Keerthi</h1>
                        <p className="text-xs text-gray-500">Welcome to your Bicycle Wallet</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-md hover:bg-gray-100" onClick={() => setNotifOpen(true)} title="Notifications">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </button>
                    <button className="p-2 rounded-md hover:bg-gray-100" title="Profile">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </div>
            </div>
            <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <section className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardBody className="text-center p-4">
                            <p className="text-sm text-gray-500">Wallet Balance</p>
                            <h2 className={`text-3xl font-bold ${balance < threshold ? "text-red-500" : "text-green-600"}`}>₹{balance.toFixed(2)}</h2>
                            <p className="text-xs text-gray-400 mt-1">Minimum balance required: ₹{threshold}</p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button onClick={() => setRechargeOpen(true)}>Recharge</Button>
                                <OutlineButton onClick={() => { alert("Gift flow open"); }}>Gift / Transfer</OutlineButton>
                            </div>
                            <div className="mt-3 text-left">
                                <label className="flex items-center justify-between text-sm">
                                    <span>Auto-Recharge</span>
                                    <Toggle checked={autoRecharge} onChange={setAutoRecharge} />
                                </label>
                                {autoRecharge && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-24" />
                                        <span className="text-sm text-gray-500">Threshold (₹)</span>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
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
                <section className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input placeholder="Search transactions" value={q} onChange={(e) => setQ(e.target.value)} />
                            <div className="hidden sm:flex gap-2 ml-2">
                                <OutlineButton onClick={() => setFilter("all")} className={filter === "all" ? "ring-2 ring-green-200" : ""}>All</OutlineButton>
                                <OutlineButton onClick={() => setFilter("recharge")} className={filter === "recharge" ? "ring-2 ring-green-200" : ""}>Recharges</OutlineButton>
                                <OutlineButton onClick={() => setFilter("ride")} className={filter === "ride" ? "ring-2 ring-green-200" : ""}>Ride Payments</OutlineButton>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <OutlineButton onClick={() => { pushNotification("info", "Sync started"); }}>Sync</OutlineButton>
                            <OutlineButton onClick={() => {
                                const rows = [["id", "type", "amount", "date", "balance"], ...transactions.map(t => [t.id || "-", t.type, t.amount, t.date, t.balance])];
                                downloadCSV("transactions.csv", rows);
                                pushNotification("success", "Exported transactions.csv");
                            }}>Export</OutlineButton>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {filtered.length === 0 && <p className="text-sm text-gray-500">No transactions</p>}
                        {filtered.map((tx) => (
                            <Card key={tx.id || tx.date}>
                                <CardBody className="flex items-center justify-between p-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{tx.type}</span>
                                            <span className="text-xs text-gray-400">• {new Date(tx.date).toLocaleString()}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Balance after: ₹{tx.balance}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`${tx.amount > 0 ? "text-green-600" : "text-red-600"} font-bold`}>{tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}</div>
                                        <OutlineButton onClick={() => {
                                            downloadCSV(`receipt_${tx.id || tx.date}.csv`, [["id", "type", "amount", "date", "balance"], [tx.id || "-", tx.type, tx.amount, tx.date, tx.balance]]);
                                            pushNotification("success", "Receipt downloaded");
                                        }}>Receipt</OutlineButton>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>
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
            <Modal
                open={rechargeOpen}
                onClose={() => setRechargeOpen(false)}
                title="Recharge Wallet"
                footer={
                    <div className="flex justify-end gap-2">
                        <OutlineButton onClick={() => setRechargeOpen(false)}>Cancel</OutlineButton>
                        <Button onClick={handleConfirmRecharge}>Confirm & Pay</Button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <div className="flex gap-2">
                        {[100, 200, 500].map((amt) => (
                            <button
                                key={amt}
                                onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                                className={`px-3 py-2 rounded-md border ${selectedAmount === amt ? "border-green-600 bg-green-50" : "bg-white"}`}
                            >
                                ₹{amt}
                            </button>
                        ))}
                    </div>
                    <div>
                        <Input placeholder="Custom amount" type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }} />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Payment method</p>
                        <select className="w-full border rounded-md p-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                            <option value="Card">Debit / Credit Card</option>
                            <option value="NetBanking">NetBanking</option>
                        </select>
                        <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={saveMethod} onChange={(e) => setSaveMethod(e.target.checked)} /> Save payment method</label>
                    </div>
                    <div>
                        <Input placeholder="Promo code (optional)" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                        {promoCode === "BIKE10" && <p className="text-sm text-green-600 mt-1">Promo applied: 10% off</p>}
                    </div>
                </div>
            </Modal>
            <Modal open={pinOpen} onClose={() => setPinOpen(false)} title={walletPin ? "Enter Wallet PIN" : "Set Wallet PIN"} footer={<div className="text-right"><Button onClick={handlePinSubmit}>{walletPin ? "Verify" : "Save PIN"}</Button></div>}>
                <div className="space-y-2">
                    <p className="text-sm text-gray-500">{walletPin ? "Enter your 4-digit PIN to continue" : "Choose a 4-digit PIN for wallet operations"}</p>
                    <Input type="password" placeholder="PIN" value={pinInput} onChange={(e) => setPinInput(e.target.value)} />
                </div>
            </Modal>
        </div>
    );
}


