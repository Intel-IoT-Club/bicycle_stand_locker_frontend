import React, { useState, useRef } from 'react';
import Modal from '../../ui/Modal.jsx';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function RegisterBikeModal({ open, onClose, onConfirm }) {
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [type, setType] = useState("NonGeared");
    const [lat, setLat] = useState("10.899481");
    const [lng, setLng] = useState("76.900322");
    const [loading, setLoading] = useState(false);
    const formRef = useRef();

    // Stagger inputs when modal opens
    useGSAP(() => {
        if (open) {
            gsap.from(".input-group", {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.5,
                delay: 0.2,
                ease: "power2.out"
            });
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!id || !name || !lat || !lng) {
            alert("All fields are required");
            return;
        }

        setLoading(true);
        try {
            const bikeData = {
                cycleName: name,
                cycleId: id.toUpperCase(),
                type,
                location: {
                    type: "Point",
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                }
            };
            await onConfirm(bikeData);
            setName("");
            setId("");
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={<span className="bg-[#016766] text-white px-4 py-1 font-black tracking-wider uppercase text-sm rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Register New Bicycle</span>}
            contentClassName="bg-white border-4 border-black rounded-none p-8 max-w-md w-full font-afacad shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
        >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div className="input-group">
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1 tracking-widest">Bike Name / Model</label>
                    <input
                        type="text"
                        placeholder="e.g. Firefox Ranger"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold outline-none focus:ring-4 ring-[#016766]/10 transition-all bg-gray-50 focus:bg-white"
                    />
                </div>

                <div className="input-group">
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1 tracking-widest">Unique Unit ID</label>
                    <input
                        type="text"
                        placeholder="e.g. C500"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold outline-none focus:ring-4 ring-[#016766]/10 transition-all bg-gray-50 focus:bg-white"
                    />
                </div>

                <div className="input-group grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-500 mb-1 tracking-widest">Bicycle Type</label>
                        <div className="relative">
                             <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold outline-none bg-white appearance-none"
                            >
                                <option value="NonGeared">Non-Geared</option>
                                <option value="Geared">Geared</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs">▼</div>
                        </div>
                       
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-gray-200 pt-4">
                    <div className="input-group">
                        <label className="block text-xs font-black uppercase text-gray-500 mb-1 tracking-widest">Latitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-black rounded-xl font-bold text-sm outline-none focus:bg-yellow-50 transition-colors"
                        />
                    </div>
                    <div className="input-group">
                        <label className="block text-xs font-black uppercase text-gray-500 mb-1 tracking-widest">Longitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-black rounded-xl font-bold text-sm outline-none focus:bg-yellow-50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-6 input-group">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 font-bold border-2 border-black rounded-xl hover:bg-gray-100 transition-all uppercase text-xs tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 py-3 font-bold text-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all bg-black hover:bg-[#016766] uppercase text-xs tracking-widest ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? 'Registering...' : 'Add to Fleet'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}