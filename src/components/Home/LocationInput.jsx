import { useState, useEffect, useRef } from "react";
import SearchIcon from "../../assets/Search_icon.png";

const COIMBATORE_VIEWBOX = "-77.00,10.80,-76.80,11.00"; // Approximate box, will refine

const LocationInput = ({ label, value, onChange, onSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    const mapkey = import.meta.env.VITE_MAP_ACCESS_TOKEN;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (value && value.length > 2 && showSuggestions) {
                try {
                    // Bounding box for Amrita Coimbatore (approx)
                    // Adjust coordinates as needed for tight restriction
                    const viewbox = "76.85,10.95,76.95,10.85"; // lon1,lat1,lon2,lat2
                    const res = await fetch(
                        `https://api.locationiq.com/v1/autocomplete?key=${mapkey}&q=${encodeURIComponent(
                            value
                        )}&limit=5&viewbox=${viewbox}&bounded=1`
                    );
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setSuggestions(data);
                    }
                } catch (err) {
                    console.error("Autocomplete error:", err);
                }
            } else {
                setSuggestions([])
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value, mapkey, showSuggestions]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="p-4 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex gap-x-4 items-center focus-within:-translate-y-1 transition-transform">
                <img src={SearchIcon} className="h-6 w-6 lg:h-8 lg:w-8" alt="Search" />
                <input
                    type="text"
                    placeholder={label}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="bg-transparent outline-none text-lg lg:text-xl font-bold flex-1 w-full"
                />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black rounded-xl shadow-lg z-50 overflow-hidden">
                    {suggestions.map((place) => (
                        <div
                            key={place.place_id}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 border-gray-100"
                            onClick={() => {
                                onChange(place.display_name); // Or format specifically
                                onSelect(place); // Pass full place obj (coords etc)
                                setShowSuggestions(false);
                            }}
                        >
                            <div className="font-bold text-sm truncate">{place.display_name.split(",")[0]}</div>
                            <div className="text-xs text-gray-500 truncate">{place.display_name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationInput;
