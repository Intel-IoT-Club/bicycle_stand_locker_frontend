
import React from 'react';
import bicycleIcon from '../../assets/Mockup-Bicycle.png';

function Header({ userName, onNotificationClick, onProfileClick, className }) {
    return (
        <div className={`max-w-5xl mx-auto p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-md font-bold bg-[#016766] flex items-center justify-center">
                    <img src={bicycleIcon} alt="Bicycle Icon" className="w-16 h-16" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-black">Hello, {userName}</h1>
                    <p className="text-xs text-gray-700">Welcome to your Bicycle Wallet</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-2 rounded-md hover:bg-black/5" onClick={onNotificationClick} title="Notifications">
                    <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>
                <button className="p-2 rounded-md hover:bg-black/5" onClick={onProfileClick} title="Profile">
                    <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
            </div>
        </div>
    );
}

export default Header;
