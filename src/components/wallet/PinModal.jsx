
import React, { useState } from 'react';
import Modal from '../../ui/Modal.jsx';
import { Button } from '../../ui/wallet_button.jsx';
import { Input } from '../../ui/input.jsx';

function PinModal({ open, onClose, onPinSubmit, walletPin, contentClassName }) {
    const [pinInput, setPinInput] = useState("");

    function handleSubmit() {
        onPinSubmit(pinInput);
        setPinInput("");
    }

    return (
        <Modal open={open} onClose={onClose} title={walletPin ? "Enter Wallet PIN" : "Set Wallet PIN"} contentClassName={contentClassName} footer={<div className="text-right"><Button onClick={handleSubmit}>{walletPin ? "Verify" : "Save PIN"}</Button></div>}>
            <div className="space-y-2 text-black">
                <p className="text-sm text-gray-700">{walletPin ? "Enter your 4-digit PIN to continue" : "Choose a 4-digit PIN for wallet operations"}</p>
                <Input type="password" placeholder="PIN" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="bg-white/50 text-black" />
            </div>
        </Modal>
    );
}

export default PinModal;
