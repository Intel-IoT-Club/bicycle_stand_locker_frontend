import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const StatCard = ({ title, value, icon, color, subtext }) => {
    const cardRef = useRef();
    const valueRef = useRef();
    
    // Check if value is currency or ratio
    const isCurrency = value.toString().includes('₹');
    const isRatio = value.toString().includes('/');
    const numericValue = parseInt(value.toString().replace(/[^0-9]/g, '')) || 0;

    useGSAP(() => {
        // Count up animation
        if(!isRatio) {
             gsap.from(valueRef.current, {
                textContent: 0,
                duration: 2,
                ease: "power2.out",
                snap: { textContent: 1 },
                onUpdate: function() {
                    if (valueRef.current) {
                        const current = Math.ceil(this.targets()[0].textContent);
                        valueRef.current.innerText = isCurrency 
                            ? `₹${current.toLocaleString()}` 
                            : current;
                    }
                }
            });
        }
    }, [value]);

    return (
        <div ref={cardRef} className="stat-card opacity-0 bg-white p-6 rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col gap-4 group">
            <div className="flex items-center justify-between">
                <div className="text-3xl p-3 rounded-2xl bg-gray-50 group-hover:scale-110 transition-transform" style={{ color: color }}>
                    {icon}
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider animate-pulse border border-gray-200">
                    Real-time
                </div>
            </div>
            <div>
                <div ref={valueRef} className="text-4xl font-extrabold text-black tracking-tight">{value}</div>
                <div className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wide">{title}</div>
            </div>
            <div className="mt-2 pt-4 border-t border-gray-100 flex items-center gap-2">
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">{subtext}</span>
            </div>
        </div>
    );
};

export default function OwnerStats({ stats }) {
    const containerRef = useRef();

    useGSAP(() => {
        const tl = gsap.timeline();
        
        // 1. Cards Pop in
        tl.to(".stat-card", {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
        })
        // 2. Chart bars grow
        .from(".chart-bar", {
            height: 0,
            duration: 1,
            stagger: 0.05,
            ease: "power3.out"
        }, "-=0.5");
    }, { scope: containerRef });

    const displayStats = [
        { title: 'Live Balance', value: `₹${stats?.walletBalance?.toLocaleString() || '0'}`, icon: '💰', color: '#016766', subtext: 'Available' },
        { title: 'Active Fleet', value: `${stats?.activeBikes || '0'}/${stats?.totalBikes || '0'}`, icon: '🚲', color: '#00ff88', subtext: 'Ridable' },
        { title: 'Total Revenue', value: `₹${stats?.totalEarnings?.toLocaleString() || '0'}`, icon: '📈', color: '#ffcc00', subtext: 'Life-time' },
        { title: 'Live Rides', value: stats?.liveRidesCount || '0', icon: '⚡', color: '#00ddeb', subtext: 'Currently Active' },
    ];

    return (
        <div ref={containerRef} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayStats.map((stat, index) => (
                    <div key={index} className="transform translate-y-10 scale-95"> 
                        <StatCard {...stat} />
                    </div>
                ))}
            </div>

            {/* Visual Analytics */}
            <div className="stat-card opacity-0 bg-white p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight">Active Usage Trends</h3>
                    <div className="flex gap-2">
                         <button className="px-4 py-1.5 bg-gray-100 rounded-lg text-xs font-bold border border-black/5 hover:bg-gray-200 hover:border-black transition-all">Weekly</button>
                        <button className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">Monthly</button>
                    </div>
                </div>

                <div className="flex-1 border-b-2 border-l-2 border-dashed border-gray-200 m-4 relative h-64">
                    <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pb-px">
                        {[40, 70, 45, 90, 65, 80, 55, 75, 95, 60, 85, 50].map((h, i) => (
                            <div 
                                key={i} 
                                className="chart-bar w-full bg-[#016766] rounded-t-sm relative group transition-all duration-300 hover:bg-black cursor-pointer" 
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 shadow-lg pointer-events-none whitespace-nowrap z-20">
                                    ₹{(h * 100).toLocaleString()}
                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="mt-4 flex justify-between text-[10px] font-bold text-gray-400 px-4 uppercase tracking-widest">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                        <span key={m}>{m}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}