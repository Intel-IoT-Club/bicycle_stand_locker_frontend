import React, { useState, useRef } from 'react';
import RegisterBikeModal from './RegisterBikeModal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const MaintenanceModal = ({ isOpen, onClose, bikeId }) => {
    const modalRef = useRef();

    useGSAP(() => {
        if(isOpen) {
            gsap.fromTo(modalRef.current, 
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.5)" }
            );
        }
    }, [isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase tracking-tight">Report Issue: {bikeId}</h3>
                    <button onClick={onClose} className="text-xl font-black hover:rotate-90 transition-transform bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center border-2 border-black">✕</button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Severity Level</label>
                        <select className="w-full p-3 bg-gray-50 border-2 border-black rounded-xl font-bold outline-none focus:ring-2 ring-black/10">
                            <option>Low (Minor scratch/adjustment)</option>
                            <option>Medium (Tire/Chain issue)</option>
                            <option>High (Brake/Light issue)</option>
                            <option>Critical (Inoperable)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Issue Description</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border-2 border-black rounded-xl font-bold outline-none min-h-[100px] focus:ring-2 ring-black/10 resize-none"
                            placeholder="Describe what's wrong..."
                        ></textarea>
                    </div>
                    <button className="w-full py-4 bg-[#016766] text-white font-black rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-widest mt-4">
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    );
};

const BikeCard = ({ bike }) => {
    const [isAvailable, setIsAvailable] = useState(bike.available);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const logsRef = useRef(null);

    // Animate Logs Drawer
    useGSAP(() => {
        if (showLogs) {
            gsap.fromTo(logsRef.current, 
                { height: 0, opacity: 0 }, 
                { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
            );
        }
    }, [showLogs]);

    return (
        <div className="bike-card bg-white p-6 rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col gap-6 relative overflow-hidden group">
            <div className="flex justify-between items-start pt-2">
                <div>
                    <div className="text-2xl font-black text-black tracking-tighter uppercase">{bike.id}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{bike.model}</div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border-2 transition-colors duration-300 ${isAvailable ? 'bg-green-100 text-green-700 border-green-500' : 'bg-red-100 text-red-700 border-red-500'
                    }`}>
                    {isAvailable ? 'VISIBLE' : 'HIDDEN'}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-5xl grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500">
                    🚲
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-400 uppercase tracking-widest text-[10px]">Health</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${bike.health === 'Excellent' || bike.health === 'Good' ? 'text-green-600 bg-green-50 border-green-200' : bike.health === 'Fair' ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                            {bike.health}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-400 uppercase tracking-widest text-[10px]">Availability</span>
                        <div
                            onClick={() => setIsAvailable(!isAvailable)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 flex items-center border-2 border-transparent hover:border-black/10 ${isAvailable ? 'bg-[#00ff88]' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all duration-300 transform ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-100 pt-4">
                <div className="flex justify-between items-center bg-[#F9F8E9] p-3 rounded-xl border border-black/5 mb-3 cursor-pointer hover:bg-[#f0efdf] transition-colors" onClick={() => setShowLogs(!showLogs)}>
                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <span>📋</span> Maintenance History
                    </span>
                    <span className={`text-[10px] font-black text-[#016766] uppercase tracking-widest transition-transform duration-300 ${showLogs ? 'rotate-180' : ''}`}>
                         ▼
                    </span>
                </div>

                {showLogs && (
                    <div ref={logsRef} className="space-y-2 mb-4 overflow-hidden">
                        {bike.logs.length > 0 ? bike.logs.map((log, i) => (
                            <div key={i} className="text-[10px] bg-white border border-gray-200 p-2 rounded-lg flex justify-between">
                                <span className="font-bold">{log.issue}</span>
                                <span className="text-gray-400 font-bold">{log.date}</span>
                            </div>
                        )) : (
                            <div className="text-[10px] text-gray-400 font-bold text-center py-2 italic bg-gray-50 rounded-lg">No issues reported yet</div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="py-2.5 bg-black text-white font-black rounded-xl border-2 border-black hover:bg-gray-800 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                >
                    Report Issue
                </button>
                <button
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`py-2.5 font-black rounded-xl border-2 border-black active:scale-95 transition-all text-[10px] uppercase tracking-widest ${isAvailable ? 'bg-white text-black hover:bg-red-50 hover:text-red-600 hover:border-red-600' : 'bg-[#016766] text-white hover:bg-[#015554]'}`}
                >
                    {isAvailable ? 'Stop Rental' : 'Activate'}
                </button>
            </div>

            <MaintenanceModal
                isOpen={showMaintenanceModal}
                onClose={() => setShowMaintenanceModal(false)}
                bikeId={bike.id}
            />
        </div>
    );
};

export default function BicycleManagement({ bikes, onRefresh, onRegister }) {
    const [registerOpen, setRegisterOpen] = useState(false);
    const list = bikes?.length > 0 ? bikes : [];
    const containerRef = useRef();

    useGSAP(() => {
        gsap.from(".bike-card-container", {
            y: 50,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)"
        });
    }, [list.length]);

    return (
        <div ref={containerRef} className="space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-8 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-3">
                        <span className="text-3xl">🏭</span> Manage My Fleet
                    </h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Monitor logs and health status</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => setRegisterOpen(true)}
                        className="flex-1 sm:flex-none px-8 py-4 bg-black text-white font-black rounded-xl border-2 border-black hover:bg-[#016766] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] uppercase text-xs tracking-widest"
                    >
                        + Add New Unit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {list.map((bike) => (
                    <div key={bike._id} className="bike-card-container">
                        <BikeCard bike={{
                            id: bike.cycleId,
                            model: bike.type,
                            available: bike.availabilityFlag,
                            health: bike.health || 'Excellent',
                            logs: [] 
                        }} />
                    </div>
                ))}

                <div className="bike-card-container h-full">
                    <div
                        onClick={() => setRegisterOpen(true)}
                        className="h-full border-4 border-dashed border-gray-300 rounded-3xl min-h-[400px] flex flex-col items-center justify-center p-10 cursor-pointer hover:border-[#016766] hover:bg-[#016766]/5 transition-all group"
                    >
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl group-hover:bg-[#016766] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg">
                            +
                        </div>
                        <div className="mt-6 font-black uppercase tracking-widest text-gray-400 group-hover:text-[#016766] transition-colors">Register New Unit</div>
                    </div>
                </div>
            </div>

            <RegisterBikeModal
                open={registerOpen}
                onClose={() => setRegisterOpen(false)}
                onConfirm={onRegister}
            />
        </div>
    );
}