import React, { useState } from 'react';
import RegisterBikeModal from './RegisterBikeModal';


const MaintenanceModal = ({ isOpen, onClose, bikeId }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Report Issue: {bikeId}</h3>
                    <button onClick={onClose} className="text-2xl font-black hover:rotate-90 transition-transform">✕</button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Severity Level</label>
                        <select className="w-full p-3 bg-gray-100 border-2 border-black rounded-xl font-bold outline-none">
                            <option>Low (Minor scratch/adjustment)</option>
                            <option>Medium (Tire/Chain issue)</option>
                            <option>High (Brake/Light issue)</option>
                            <option>Critical (Inoperable)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Issue Description</label>
                        <textarea
                            className="w-full p-3 bg-gray-100 border-2 border-black rounded-xl font-bold outline-none min-h-[100px]"
                            placeholder="Describe what's wrong..."
                        ></textarea>
                    </div>
                    <button className="w-full py-4 bg-[#016766] text-white font-black rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-widest mt-4">
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

    return (
        <div className="bg-white p-6 rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col gap-6 relative overflow-hidden group">
            <div className="flex justify-between items-start pt-2">
                <div>
                    <div className="text-2xl font-black text-black tracking-tighter uppercase">{bike.id}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{bike.model}</div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border-2 ${isAvailable ? 'bg-green-100 text-green-700 border-green-500' : 'bg-red-100 text-red-700 border-red-500'
                    }`}>
                    {isAvailable ? 'VISIBLE TO RIDERS' : 'HIDDEN FROM RIDERS'}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center text-5xl grayscale group-hover:grayscale-0 transition-all">
                    🚲
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-400 uppercase tracking-widest text-[10px]">Health</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${bike.health === 'Excellent' || bike.health === 'Good' ? 'text-green-600 bg-green-50' : bike.health === 'Fair' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'}`}>
                            {bike.health}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-400 uppercase tracking-widest text-[10px]">Availability</span>
                        <div
                            onClick={() => setIsAvailable(!isAvailable)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 flex items-center ${isAvailable ? 'bg-[#00ff88]' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all duration-300 transform ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-100 pt-4">
                <div className="flex justify-between items-center bg-[#F9F8E9] p-3 rounded-xl border border-black/5 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest">Maintenance History</span>
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="text-[10px] font-black text-[#016766] underline uppercase tracking-widest"
                    >
                        {showLogs ? 'Hide Logs' : `${bike.logs.length} Logs`}
                    </button>
                </div>

                {showLogs && (
                    <div className="space-y-2 mb-4 max-h-[100px] overflow-auto pr-2">
                        {bike.logs.length > 0 ? bike.logs.map((log, i) => (
                            <div key={i} className="text-[10px] bg-white border border-gray-200 p-2 rounded-lg flex justify-between">
                                <span className="font-bold">{log.issue}</span>
                                <span className="text-gray-400 font-bold">{log.date}</span>
                            </div>
                        )) : (
                            <div className="text-[10px] text-gray-400 font-bold text-center py-2 italic">No issues reported yet</div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="py-2.5 bg-black text-white font-black rounded-xl border-2 border-black hover:bg-gray-800 transition-all text-[10px] uppercase tracking-widest"
                >
                    Report Issue
                </button>
                <button
                    onClick={() => setIsAvailable(!isAvailable)}
                    className="py-2.5 bg-white text-black font-black rounded-xl border-2 border-black hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest"
                >
                    {isAvailable ? 'STOP RENTAL' : 'START RENTAL'}
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

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border-2 border-black">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-black">Manage My Fleet</h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Monitor logs and health status</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => setRegisterOpen(true)}
                        className="flex-1 sm:flex-none px-8 py-3 bg-black text-white font-black rounded-xl border-2 border-black hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-xs tracking-widest"
                    >
                        Add New Unit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {list.map((bike) => (
                    <BikeCard key={bike._id} bike={{
                        id: bike.cycleId,
                        model: bike.type,
                        available: bike.availabilityFlag,
                        health: bike.health || 'Excellent',
                        logs: [] // Logs can be fetched per bike later
                    }} />
                ))}

                <div
                    onClick={() => setRegisterOpen(true)}
                    className="border-4 border-dashed border-gray-200 rounded-3xl min-h-[300px] flex flex-col items-center justify-center p-10 cursor-pointer hover:border-black/20 transition-all group"
                >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-4xl group-hover:bg-[#016766] group-hover:text-white transition-all">
                        +
                    </div>
                    <div className="mt-4 font-black uppercase tracking-widest text-[#016766]">Register New Unit</div>
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
