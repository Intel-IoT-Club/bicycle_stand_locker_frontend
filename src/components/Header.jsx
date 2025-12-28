import React from 'react';
import bicycleIcon from '../assets/icon.png'; // Ensure this path is correct

function Header({ userName, onNotificationClick, onProfileClick, className }) {
    return (
        <div className={`w-full py-4 px-6 flex items-center justify-between bg-[#F9F8E9] ${className}`}>
            <div className="flex items-center gap-4">
                {/* Green Box Icon similar to Ride Tracking map box */}
                <div className="w-14 h-14 rounded-xl bg-[#016766] flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                     {/* Assuming icon.png exists, otherwise use a text fallback */}
                    <img src={bicycleIcon} alt="App" className="w-8 h-8 object-contain invert brightness-0 grayscale-0" style={{ filter: 'brightness(0) invert(1)' }} /> 
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-black leading-none">Hello, {userName || 'Rider'}</h1>
                    <p className="text-sm text-gray-600 font-medium mt-1">Wallet & Payments</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={onNotificationClick} 
                    className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all"
                >
                    🔔
                </button>
                <div 
                    onClick={onProfileClick}
                    className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg border-2 border-black cursor-pointer"
                >
                    {userName ? userName[0].toUpperCase() : 'U'}
                </div>
            </div>
        </div>
    );
}

export default Header;