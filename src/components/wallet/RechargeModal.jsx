
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

function RechargeModal({ open, onClose, onConfirm }) {
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [saveMethod, setSaveMethod] = useState(false);
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
            title="Recharge Wallet"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm & Pay</Button>
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
    );
}

export default RechargeModal;
