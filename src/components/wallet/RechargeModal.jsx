import React, { useState } from 'react';
import Modal from '../../ui/Modal.jsx';
import { Input } from '../../ui/input.jsx';

function RechargeModal({ open, onClose, onConfirm }) {
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [promoCode, setPromoCode] = useState("");

    function handleConfirm() {
        const amount = selectedAmount || Number(customAmount || 0);
        if (!amount || amount <= 0) {
            alert("Enter a valid amount.");
            return;
        }
        onConfirm(amount);
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={
                // Title with Green Background style like the image
                <span className="bg-[#016766] text-white px-4 py-1 font-bold text-lg inline-block shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    Recharge Wallet
                </span>
            }
            // Black Background as per your image
            contentClassName="bg-black border-4 border-white rounded-none p-0 overflow-hidden max-w-md w-full font-afacad shadow-2xl"
            headerClassName="border-none pb-0 pt-6 px-6"
            footer={null}
        >
            <div className="p-6 space-y-8">
                
                {/* Amount Section */}
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <span className="bg-[#016766] text-white px-3 py-1 font-bold text-sm uppercase tracking-wider">
                            Select Amount
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[100, 200, 500].map((amt) => (
                            <button
                                key={amt}
                                onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                                className={`
                                    h-14 rounded-xl font-bold text-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1
                                    ${selectedAmount === amt 
                                        ? "bg-white text-[#016766] border-[#016766] ring-2 ring-[#016766] ring-offset-2 ring-offset-black" 
                                        : "bg-white text-black border-gray-300 hover:bg-gray-100"
                                    }
                                `}
                            >
                                <span className={selectedAmount === amt ? "bg-[#016766] text-white px-1" : ""}>
                                    ₹{amt}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Amount Input */}
                <div className="space-y-2">
                    <div className="relative flex items-center bg-white rounded-xl overflow-hidden h-14 border-2 border-white focus-within:border-[#016766]">
                        {/* The Icon Box on the left */}
                        <div className="bg-[#016766] h-full w-14 flex items-center justify-center text-white text-2xl font-bold">
                            ₹
                        </div>
                        <Input 
                            placeholder="Enter custom amount" 
                            type="number" 
                            value={customAmount} 
                            onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }} 
                            className="border-none bg-transparent h-full text-black font-bold text-xl px-4 placeholder:text-gray-400 placeholder:text-lg focus:ring-0" 
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                    <div className="flex justify-start">
                         <span className="bg-[#016766] text-white px-3 py-1 font-bold text-sm uppercase tracking-wider">
                            Payment Method
                        </span>
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden border-2 border-white h-14 flex items-center px-4 relative">
                        <select 
                            className="w-full bg-transparent text-black font-bold text-lg focus:outline-none appearance-none z-10" 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="UPI">UPI (Google Pay / PhonePe)</option>
                            <option value="Card">Credit / Debit Card</option>
                            <option value="NetBanking">NetBanking</option>
                        </select>
                        {/* Custom dropdown arrow */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#016766]">
                            ▼
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-4 pt-4">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 text-white font-bold hover:underline"
                    >
                        <span className="bg-[#016766] px-4 py-2">Cancel</span>
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="px-6 py-2 text-white font-bold hover:opacity-90 transition-opacity"
                    >
                         <span className="bg-[#016766] px-6 py-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all border border-white">
                            Pay Securely
                        </span>
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default RechargeModal;