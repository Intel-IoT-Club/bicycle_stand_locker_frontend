import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/Contexts/authContext';
import OwnerStats from '../components/Owner/OwnerStats';
import OwnerWallet from '../components/Owner/OwnerWallet';
import BicycleManagement from '../components/Owner/BicycleManagement';
import LiveRides from '../components/Owner/LiveRides';
import WithdrawModal from '../components/Owner/WithdrawModal';

const OwnerDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawOpen, setWithdrawOpen] = useState(false);

    const fetchData = async () => {
        if (!token) return;
        try {
            const [statsRes, bikesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/owner/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/owner/bikes`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (statsRes.data.success) setDashboardData(statsRes.data.stats);
            if (bikesRes.data.success) setBikes(bikesRes.data.bikes);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const handleRegisterConfirm = async (bikeData) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/owner/register-unit`, bikeData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                alert("Bicycle registered successfully!");
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Registration failed");
            throw err;
        }
    };

    const handleDeleteConfirm = async (bikeId) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/owner/bike/${bikeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                alert("Bicycle unit removed successfully!");
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Deletion failed");
        }
    };

    const handleDeleteAllConfirm = async () => {
        if (!window.confirm("WARNING: This will delete ALL bicycles in your fleet. This action cannot be undone. Are you sure?")) {
            return;
        }
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/owner/bikes/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                alert(res.data.message);
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to delete all bikes");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const handleWithdrawConfirm = async (amount, pin) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/wallet/${user.id}/withdraw`, {
                amount,
                pin
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                alert("Withdrawal successful!");
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Withdrawal failed");
            throw err;
        }
    };

    const navItems = [
        { id: 'Overview', label: 'Home' },
        { id: 'Availability', label: 'My Fleet' },
        { id: 'Live', label: 'Live Operations' },
        { id: 'Wallet', label: 'Payouts' },
    ];

    if (!token) return null;

    return (
        <div className="min-h-screen bg-[#F9F8E9] font-afacad text-black pb-20">
            {/* Header Mirroring the Riders UI Header */}
            <div className="flex justify-between px-4 lg:px-10 items-center w-full h-16 bg-black text-white sticky top-0 z-50 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="cursor-pointer font-bold text-xl lg:text-2xl tracking-tighter text-[#00ff88]" onClick={() => navigate("/home")}>
                        AMRITA <span className="text-white">BRS</span>
                    </div>
                    <div className="hidden md:block px-3 py-1 bg-[#1c1c1c] rounded text-[10px] font-bold text-[#00ff88] border border-[#00ff88]/30">
                        OWNER PORTAL
                    </div>
                </div>

                <div className="flex gap-x-8 items-center">
                    <div className="hidden md:flex gap-x-8">
                        {navItems.map(item => (
                            <div
                                key={item.id}
                                className={`cursor-pointer transition-all ${activeTab === item.id ? 'text-[#00ff88] font-bold' : 'hover:text-[#00ff88]'}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-x-3 border-l border-white/20 pl-4 lg:pl-8">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#016766] rounded-full flex items-center justify-center font-bold border-2 border-white/10 text-white text-sm lg:text-base">
                            {user?.userName?.charAt(0).toUpperCase() || "O"}
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-bold leading-none">{user?.userName || 'Owner'}</div>
                            <div className="text-[10px] text-gray-400">Main Administrator</div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-red-600 px-3 py-1.5 lg:px-4 rounded-lg text-xs lg:text-sm font-bold hover:bg-red-700 transition-colors shadow-lg"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Nav Bar */}
            <div className="md:hidden flex overflow-x-auto bg-[#e5e4d3] px-4 py-3 gap-3 border-b border-black/5 no-scrollbar">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === item.id ? 'bg-[#016766] text-white' : 'bg-white text-gray-600'}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto p-4 lg:p-10">
                <div className="mb-6 lg:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-black flex items-center gap-4">
                            {activeTab === 'Overview' && "Owner's Home"}
                            {activeTab === 'Availability' && "Fleet Management"}
                            {activeTab === 'Live' && "Live Operations"}
                            {activeTab === 'Wallet' && "Financial Overview"}
                        </h1>
                        <p className="text-gray-600 mt-2 font-medium">Amrita Bicycle Rental System</p>
                    </div>

                    {/* Quick Button consistent with Riders UI */}
                    {(activeTab === 'Overview' || activeTab === 'Wallet') && (
                        <button
                            onClick={() => setWithdrawOpen(true)}
                            className="px-6 py-3 lg:px-8 bg-[#016766] text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all w-full sm:w-auto"
                        >
                            Withdraw Earnings
                        </button>
                    )}
                </div>

                <div className="transition-all duration-300">
                    {loading && <div className="text-center py-20 font-bold uppercase tracking-widest animate-pulse">Synchronizing Live Data...</div>}
                    {!loading && activeTab === 'Overview' && <OwnerStats stats={dashboardData} />}
                    {!loading && activeTab === 'Availability' && (
                        <BicycleManagement
                            bikes={bikes}
                            onRefresh={fetchData}
                            onRegister={handleRegisterConfirm}
                            onDelete={handleDeleteConfirm}
                            onDeleteAll={handleDeleteAllConfirm}
                        />
                    )}
                    {!loading && activeTab === 'Live' && <LiveRides />}
                    {!loading && activeTab === 'Wallet' && <OwnerWallet />}
                </div>
            </main>

            <WithdrawModal
                open={withdrawOpen}
                onClose={() => setWithdrawOpen(false)}
                balance={dashboardData?.walletBalance || 0}
                onConfirm={handleWithdrawConfirm}
            />
        </div>
    );
};

export default OwnerDashboard;
