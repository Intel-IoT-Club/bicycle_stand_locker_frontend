import React, { useState } from 'react';
import Modal from '../../ui/Modal.jsx';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function WithdrawModal({ open, onClose, balance, onConfirm }) {
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);

    useGSAP(() => {
        if(open) {
            gsap.from(".withdraw-element", {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                ease: "power2.out",
                duration: 0.4
            });
        }
    }, [open]);

    const handleWithdraw = async () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        if (amt > balance) {
            // Simple shake animation on error
            gsap.to(".amount-input", { x: [-5, 5, -5, 5, 0], duration: 0.3 });
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
            title={<span className="bg-red-600 text-white px-4 py-1 font-black uppercase text-sm rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Withdraw Earnings</span>}
            contentClassName="bg-white border-4 border-black rounded-none p-8 max-w-md w-full font-afacad shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
            <div className="space-y-8 mt-4">
                <div className="withdraw-element bg-[#F9F8E9] p-4 rounded-xl border-2 border-black border-dashed text-center">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Available Balance</label>
                    <div className="text-4xl font-black text-[#016766]">₹{balance?.toLocaleString()}</div>
                </div>

                <div className="space-y-5">
                    <div className="withdraw-element">
                        <label className="block text-xs font-black uppercase mb-2 tracking-wide">Withdraw Amount</label>
                        <div className="relative amount-input">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 border-2 border-black rounded-xl font-bold text-xl outline-none focus:ring-4 ring-red-500/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="withdraw-element">
                        <label className="block text-xs font-black uppercase mb-2 tracking-wide">Wallet PIN</label>
                        <input
                            type="password"
                            maxLength={4}
                            placeholder="• • • •"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold text-center tracking-[1em] text-2xl outline-none focus:ring-4 ring-red-500/10 transition-all"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4 withdraw-element">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 font-bold border-2 border-black rounded-xl hover:bg-gray-100 transition-all uppercase text-xs tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleWithdraw}
                        disabled={loading}
                        className={`flex-1 py-3 font-bold text-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all bg-red-600 hover:bg-red-700 uppercase text-xs tracking-widest ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}