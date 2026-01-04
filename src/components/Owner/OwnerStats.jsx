import React from 'react';

const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className="text-3xl" style={{ color: color }}>
                {icon}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Real-time
            </div>
        </div>
        <div>
            <div className="text-4xl font-extrabold text-black tracking-tight">{value}</div>
            <div className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wide">{title}</div>
        </div>
        <div className="mt-2 pt-4 border-t border-gray-100 flex items-center gap-2">
            <span className="text-green-500 font-bold text-xs">{subtext}</span>
            <span className="text-gray-400 text-[10px] font-medium">from last month</span>
        </div>
    </div>
);

export default function OwnerStats({ stats }) {
    const displayStats = [
        {
            title: 'Live Balance',
            value: `₹${stats?.walletBalance?.toLocaleString() || '0'}`,
            icon: '💳',
            color: '#016766',
            subtext: 'Available'
        },
        {
            title: 'Active Fleet',
            value: `${stats?.activeBikes || '0'}/${stats?.totalBikes || '0'}`,
            icon: '🚲',
            color: '#00ff88',
            subtext: 'Ridable'
        },
        {
            title: 'Total Revenue',
            value: `₹${stats?.totalEarnings?.toLocaleString() || '0'}`,
            icon: '💰',
            color: '#ffcc00',
            subtext: 'Life-time'
        },
        {
            title: 'Live Rides',
            value: stats?.liveRidesCount || '0',
            icon: '🕒',
            color: '#00ddeb',
            subtext: 'Currently Active'
        },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayStats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Visual Analytics */}
            <div className="bg-white p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight">Active Usage Trends</h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-1.5 bg-gray-100 rounded-lg text-xs font-bold border border-black/5 hover:bg-gray-200">Weekly</button>
                        <button className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-bold border border-black hover:bg-gray-900 transition-all">Monthly</button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="text-4xl mb-4">📊</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">
                        <p>Not enough historical data</p>
                        <p className="text-[10px] mt-1 opacity-60">Ride trends will appear here once more trips are completed.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
