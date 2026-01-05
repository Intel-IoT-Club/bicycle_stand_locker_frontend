import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Contexts/authContext';

export default function LiveRides() {
    const { token } = useAuth();
    const [ongoingRides, setOngoingRides] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLiveRides = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/owner/live-rides`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setOngoingRides(res.data.rides);
            }
        } catch (err) {
            console.error("Failed to fetch live rides:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchLiveRides();
            const interval = setInterval(fetchLiveRides, 10000); // 10s poll
            return () => clearInterval(interval);
        }
    }, [token]);

    const calculateDuration = (startTime) => {
        const start = new Date(startTime);
        const now = new Date();
        const diff = Math.floor((now - start) / 60000); // minutes
        return diff > 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff} mins`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Active Sessions</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time ride tracking</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-black uppercase">{ongoingRides.length} Live</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ongoingRides.map((ride) => (
                    <div key={ride._id} className="bg-white p-6 rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-xs font-black text-[#016766] uppercase tracking-[0.2em]">RIDE-{ride._id.slice(-4).toUpperCase()}</div>
                                <div className="text-2xl font-black text-black">Bike {ride.bikeName || ride.bikeId}</div>
                            </div>
                            <div className="px-3 py-1 bg-green-100 text-green-700 border-2 border-green-500 rounded-lg text-[10px] font-black uppercase">
                                In Progress
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-[#F9F8E9] p-4 rounded-2xl border-2 border-black/5">
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Rider</div>
                                <div className="text-sm font-black">{ride.riderId?.userName || 'Anonymous'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Started</div>
                                <div className="text-sm font-black">{new Date(ride.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Duration</div>
                                <div className="text-sm font-black">{calculateDuration(ride.startedAt)}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Fare So Far</div>
                                <div className="text-sm font-black">₹{ride.payment?.amount || 0}</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-3 bg-black text-white font-black rounded-xl border-2 border-black hover:bg-gray-800 transition-all text-xs uppercase tracking-widest">
                                Track Map
                            </button>
                            <button className="flex-1 py-3 bg-white text-black font-black rounded-xl border-2 border-black hover:bg-gray-50 transition-all text-xs uppercase tracking-widest">
                                Contact Rider
                            </button>
                        </div>
                    </div>
                ))}

                {ongoingRides.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-black border-dashed flex flex-col items-center justify-center text-gray-400 font-bold">
                        <div className="text-5xl mb-4">💤</div>
                        <div>No active rides for your bikes right now</div>
                    </div>
                )}
            </div>
        </div>
    );
}
