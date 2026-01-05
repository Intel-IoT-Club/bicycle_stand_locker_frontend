import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Contexts/authContext';

export default function OwnerWallet() {
    const { token } = useAuth();
    const [rides, setRides] = useState([]);
    const [filter, setFilter] = useState('All');
    const [bankDetails, setBankDetails] = useState({
        accountName: '',
        accountNumber: '',
        ifsc: '',
        bankName: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchWalletData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/owner/wallet-data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setRides(res.data.rides);
                setBankDetails(res.data.bankDetails || {
                    accountName: '',
                    accountNumber: '',
                    ifsc: '',
                    bankName: ''
                });
            }
        } catch (err) {
            console.error("Failed to fetch wallet data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchWalletData();
    }, [token]);

    const handleBankSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/owner/bank-details`, bankDetails, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                alert("Bank details updated successfully!");
            }
        } catch (err) {
            console.error("Failed to save bank details:", err);
            alert("Failed to save bank details.");
        } finally {
            setSaving(false);
        }
    };

    const getStatus = (ride) => {
        if (ride.status === 'cancelled') return 'Failed';
        if (ride.payment?.paid) return 'Received';
        return 'Pending';
    };

    const filteredRides = rides.filter(ride => {
        if (filter === 'All') return true;
        return getStatus(ride) === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Received': return 'bg-green-100 text-green-700 border-green-500';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-500';
            case 'Failed': return 'bg-red-100 text-red-700 border-red-500';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="text-center py-10 font-bold animate-pulse">Loading Wallet Data...</div>;

    return (
        <div className="space-y-8">
            {/* Bank Details Section */}
            <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-8 border-b-2 border-black bg-gray-50">
                    <h3 className="text-xl font-bold uppercase tracking-tight">Bank Account Details</h3>
                    <p className="text-sm text-gray-500 mt-1">For receiving scheduled payouts</p>
                </div>
                <div className="p-8">
                    <form onSubmit={handleBankSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Account Holder Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#016766] outline-none font-bold transition-all"
                                value={bankDetails.accountName}
                                onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                placeholder="e.g. JOHN DOE"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Account Number</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#016766] outline-none font-bold transition-all"
                                value={bankDetails.accountNumber}
                                onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                placeholder="XXXX-XXXX-XXXX"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">IFSC Code</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#016766] outline-none font-bold transition-all uppercase"
                                value={bankDetails.ifsc}
                                onChange={e => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                                placeholder="ABCD0123456"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Bank Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#016766] outline-none font-bold transition-all"
                                value={bankDetails.bankName}
                                onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                placeholder="e.g. HDFC Bank"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-[#016766] text-white font-bold rounded-xl border-2 border-black hover:transform hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Bank Details'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-8 border-b-2 border-black bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-bold uppercase tracking-tight">Ride Transactions</h3>

                    <div className="flex gap-2 bg-white p-1 rounded-xl border-2 border-black">
                        {['All', 'Received', 'Pending', 'Failed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-[#016766] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b-2 border-gray-100">
                                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Rider</th>
                                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Reference ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRides.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-400">No transactions found</td></tr>
                                ) : filteredRides.map((ride) => (
                                    <tr key={ride._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-6 font-bold text-gray-700">
                                            {new Date(ride.createdAt).toLocaleDateString()}
                                            <div className="text-xs text-gray-400 font-normal">{new Date(ride.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold">{ride.riderId?.userName || 'Unknown'}</div>
                                            <div className="text-xs text-gray-400">{ride.riderId?.phone}</div>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-black text-lg">
                                            ₹{ride.finalFare?.toFixed(2) || ride.fare?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${getStatusColor(getStatus(ride))}`}>
                                                {getStatus(ride)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-xs text-gray-400">
                                            {ride._id.slice(-8).toUpperCase()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col gap-4 p-4">
                        {filteredRides.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No transactions found</div>
                        ) : filteredRides.map((ride) => (
                            <div key={ride._id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start border-b pb-2">
                                    <div>
                                        <div className="font-bold text-lg">{ride.riderId?.userName || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{ride.riderId?.phone}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${getStatusColor(getStatus(ride))}`}>
                                        {getStatus(ride)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                    <div>
                                        <span className="text-gray-500 block text-xs">Date</span>
                                        {new Date(ride.createdAt).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Time</span>
                                        {new Date(ride.createdAt).toLocaleTimeString()}
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Amount</span>
                                        <span className="font-bold text-black">₹{ride.finalFare?.toFixed(2) || ride.fare?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Ref ID</span>
                                        <span className="font-mono text-xs text-gray-400">{ride._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
