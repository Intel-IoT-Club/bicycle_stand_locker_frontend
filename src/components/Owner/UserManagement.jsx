import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Contexts/authContext';

export default function UserManagement() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/owner/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    const filteredUsers = users.filter(u =>
        u.userName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-8 border-b-2 border-black bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold uppercase tracking-tight">System Users History</h3>

                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-6 py-2 rounded-xl border-2 border-black outline-none focus:ring-2 ring-[#016766]/20 transition-all font-bold text-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white border-b-2 border-gray-100">
                            <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">User Profile</th>
                            <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                            <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Wallet</th>
                            <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10 font-bold animate-pulse">Loading Users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-400">No users found</td></tr>
                        ) : filteredUsers.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#F9F8E9] border-2 border-black rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-[#016766] group-hover:text-white transition-all">
                                            {u.userName ? u.userName[0].toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg text-black">{u.userName}</div>
                                            <div className="text-xs text-gray-400 font-medium">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 font-bold text-gray-700">{u.phone || 'N/A'}</td>
                                <td className="px-8 py-6">
                                    <div className="inline-block px-3 py-1 bg-[#F9F8E9] border-2 border-black rounded-lg font-bold text-sm">
                                        ₹{u.walletBalance?.toFixed(2) || '0.00'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border-2 ${u.role === 'owner' ? 'bg-purple-100 text-purple-700 border-purple-500' : 'bg-green-100 text-green-700 border-green-500'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right font-bold text-gray-400 text-sm">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-8 bg-gray-50 border-t-2 border-black flex justify-center">
                <button onClick={fetchUsers} className="text-[#016766] font-bold text-sm hover:underline">Refresh List</button>
            </div>
        </div>
    );
}
