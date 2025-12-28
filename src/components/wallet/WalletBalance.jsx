import React from 'react';
import { Input } from '../../ui/input.jsx';
import Toggle from '../../ui/Toggle.jsx';

function WalletBalance({ balance, threshold, onRechargeClick, autoRecharge, onAutoRechargeChange, onThresholdChange, onSetPin }) {
    return (
        <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-lg flex flex-col items-center text-center relative overflow-hidden">
            {/* Decorative Circle similar to RideTracking stats */}
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#016766] rounded-full opacity-20 blur-xl"></div>
            
            <p className="text-gray-400 text-lg font-medium uppercase tracking-wider">Total Balance</p>
            
            <h2 className={`text-6xl font-bold mt-2 mb-6 ${balance < threshold ? "text-red-500" : "text-white"}`}>
                ₹{balance.toFixed(0)}<span className="text-2xl text-gray-400">.{balance.toFixed(2).split('.')[1]}</span>
            </h2>

            <div className="w-full grid grid-cols-2 gap-4 mb-6">
                <button 
                    onClick={onRechargeClick} 
                    className="bg-[#016766] hover:bg-[#015554] text-white text-xl font-bold py-4 rounded-xl transition-transform active:scale-95"
                >
                    + Add Money
                </button>
                <button 
                    onClick={onSetPin}
                    className="bg-transparent border-2 border-white hover:bg-white/10 text-white text-xl font-bold py-4 rounded-xl transition-colors"
                >
                    Wallet PIN
                </button>
            </div>

            <div className="w-full bg-white/10 rounded-xl p-4 flex items-center justify-between border border-white/10">
                <div className="text-left">
                    <p className="font-bold text-lg">Auto-Recharge</p>
                    <p className="text-xs text-gray-400">Triggers when below ₹{threshold}</p>
                </div>
                <div className="flex items-center gap-4">
                     {autoRecharge && (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/20">
                            <span className="text-sm text-gray-300">₹</span>
                            <input 
                                type="number" 
                                value={threshold} 
                                onChange={(e) => onThresholdChange(Number(e.target.value))} 
                                className="w-12 bg-transparent text-white font-bold focus:outline-none text-right"
                            />
                        </div>
                    )}
                    <Toggle checked={autoRecharge} onChange={onAutoRechargeChange} />
                </div>
            </div>
        </div>
    );
}

export default WalletBalance;