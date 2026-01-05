import React, { useState } from 'react';
import Modal from '../../ui/Modal.jsx';

export default function RegisterBikeModal({ open, onClose, onConfirm }) {
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [type, setType] = useState("NonGeared");
    const [lat, setLat] = useState("10.899481"); // Default to demo lat
    const [lng, setLng] = useState("76.900322"); // Default to demo lng
    const [loading, setLoading] = useState(false);
    const [locLoading, setLocLoading] = useState(false);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLat(position.coords.latitude.toFixed(6));
                setLng(position.coords.longitude.toFixed(6));
                setLocLoading(false);
            },
            (error) => {
                console.error(error);
                alert("Unable to retrieve your location");
                setLocLoading(false);
            }
        );
    };

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
            title={<span className="bg-[#016766] text-white px-4 py-1 font-bold">Register New Bicycle</span>}
            contentClassName="bg-white border-4 border-black rounded-none p-6 max-w-md w-full font-afacad"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Bike Name / Model</label>
                    <input
                        type="text"
                        placeholder="e.g. Firefox Ranger"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-black rounded-xl font-bold outline-none focus:ring-2 ring-[#016766]/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Unique Unit ID</label>
                    <input
                        type="text"
                        placeholder="e.g. C500"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-black rounded-xl font-bold outline-none focus:ring-2 ring-[#016766]/20"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Bicycle Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-black rounded-xl font-bold outline-none bg-white"
                        >
                            <option value="NonGeared">Non-Geared</option>
                            <option value="Geared">Geared</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-gray-100 pt-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Latitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-black rounded-xl font-bold text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Longitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-black rounded-xl font-bold text-sm outline-none"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locLoading}
                    className="w-full py-2 bg-[#016766] text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all uppercase text-xs tracking-widest"
                >
                    {locLoading ? "Fetching Location..." : "📍 Get Current Live Location"}
                </button>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 font-bold border-2 border-black rounded-xl hover:bg-gray-50 transition-all uppercase text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 py-3 font-bold text-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all bg-black hover:bg-gray-800 uppercase text-xs ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? 'Registering...' : 'Add to Fleet'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
