import React, { useState } from 'react';
import Modal from '../../ui/Modal.jsx';

export default function WithdrawModal({ open, onClose, balance, onConfirm }) {
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);

    const handleWithdraw = async () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        if (amt > balance) {
            alert("Insufficient balance");
            return;
        }

        setLoading(true);
        try {
            await onConfirm(amt, pin);
            setAmount("");
            setPin("");
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={<span className="bg-red-600 text-white px-4 py-1 font-bold">Withdraw Earnings</span>}
            contentClassName="bg-white border-4 border-black rounded-none p-6 max-w-md w-full font-afacad"
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Available Balance</label>
                    <div className="text-3xl font-black text-[#016766]">₹{balance?.toLocaleString()}</div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-black uppercase mb-1">Withdraw Amount</label>
                        <input
                            type="number"
                            placeholder="Enter amount (₹)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-lg outline-none focus:ring-2 ring-red-500/20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black uppercase mb-1">Wallet PIN</label>
                        <input
                            type="password"
                            maxLength={4}
                            placeholder="****"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-center tracking-widest text-2xl outline-none focus:ring-2 ring-red-500/20"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 font-bold border-2 border-black rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleWithdraw}
                        disabled={loading}
                        className={`flex-1 py-3 font-bold text-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all bg-red-600 hover:bg-red-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : 'Confirm Withdrawal'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
