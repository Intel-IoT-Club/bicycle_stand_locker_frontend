
import React from 'react';
import { Card, CardBody } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Toggle from '../ui/Toggle';

function WalletBalance({ balance, threshold, onRechargeClick, autoRecharge, onAutoRechargeChange, onThresholdChange }) {
    return (
        <Card>
            <CardBody className="text-center p-4">
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <h2 className={`text-3xl font-bold ${balance < threshold ? "text-red-500" : "text-green-600"}`}>₹{balance.toFixed(2)}</h2>
                <p className="text-xs text-gray-400 mt-1">Minimum balance required: ₹{threshold}</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button onClick={onRechargeClick}>Recharge</Button>
                    <Button variant="outline" onClick={() => { alert("Gift flow open"); }}>Gift / Transfer</Button>
                </div>
                <div className="mt-3 text-left">
                    <label className="flex items-center justify-between text-sm">
                        <span>Auto-Recharge</span>
                        <Toggle checked={autoRecharge} onChange={onAutoRechargeChange} />
                    </label>
                    {autoRecharge && (
                        <div className="mt-2 flex items-center gap-2">
                            <Input type="number" value={threshold} onChange={(e) => onThresholdChange(Number(e.target.value))} className="w-24" />
                            <span className="text-sm text-gray-500">Threshold (₹)</span>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

export default WalletBalance;
