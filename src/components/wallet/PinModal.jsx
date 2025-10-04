
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

function PinModal({ open, onClose, onPinSubmit, walletPin }) {
    const [pinInput, setPinInput] = useState("");

    function handleSubmit() {
        onPinSubmit(pinInput);
        setPinInput("");
    }

    return (
        <Modal open={open} onClose={onClose} title={walletPin ? "Enter Wallet PIN" : "Set Wallet PIN"} footer={<div className="text-right"><Button onClick={handleSubmit}>{walletPin ? "Verify" : "Save PIN"}</Button></div>}>
            <div className="space-y-2">
                <p className="text-sm text-gray-500">{walletPin ? "Enter your 4-digit PIN to continue" : "Choose a 4-digit PIN for wallet operations"}</p>
                <Input type="password" placeholder="PIN" value={pinInput} onChange={(e) => setPinInput(e.target.value)} />
            </div>
        </Modal>
    );
}

export default PinModal;
