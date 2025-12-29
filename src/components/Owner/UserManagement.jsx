import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../Contexts/authContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function UserManagement() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const containerRef = useRef();

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

    // Animate table rows when users data changes
    useGSAP(() => {
        if (users.length > 0) {
            gsap.from(".user-row", {
                opacity: 0,
                x: -20,
                duration: 0.5,
                stagger: 0.05,
                ease: "power2.out"
            });
        }
    }, [users]);

    const filteredUsers = users.filter(u =>
        u.userName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={containerRef} className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-8 border-b-2 border-black bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                    <span className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">👥</span>
                    System Users History
                </h3>

                <div className="flex gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-64 px-6 py-3 rounded-xl border-2 border-black outline-none focus:ring-4 ring-[#016766]/10 focus:shadow-[4px_4px_0px_0px_rgba(1,103,102,0.2)] transition-all font-bold text-sm placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b-2 border-gray-100">
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Phone</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Wallet</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-20 font-bold animate-pulse text-gray-400">Loading Users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-20 text-gray-400 font-bold">No users found matching "{search}"</td></tr>
                        ) : filteredUsers.map((u) => (
                            <tr key={u._id} className="user-row hover:bg-gray-50 transition-all cursor-pointer group relative">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#F9F8E9] border-2 border-black rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-[#016766] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none">
                                            {u.userName ? u.userName[0].toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg text-black group-hover:text-[#016766] transition-colors">{u.userName}</div>
                                            <div className="text-xs text-gray-400 font-medium">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 font-bold text-gray-700 font-mono">{u.phone || 'N/A'}</td>
                                <td className="px-8 py-5">
                                    <div className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-lg font-bold text-sm text-green-700 shadow-sm">
                                        ₹{u.walletBalance?.toFixed(2) || '0.00'}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border-2 ${u.role === 'owner' ? 'bg-purple-100 text-purple-700 border-purple-500' : 'bg-green-100 text-green-700 border-green-500'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right font-bold text-gray-400 text-xs">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 bg-gray-50 border-t-2 border-black flex justify-center">
                <button 
                    onClick={fetchUsers} 
                    className="text-[#016766] font-black text-xs uppercase tracking-widest hover:bg-white hover:px-4 hover:py-2 hover:rounded-lg hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200"
                >
                    ↻ Refresh List
                </button>
            </div>
        </div>
    );
}