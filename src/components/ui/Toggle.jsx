
import React from 'react';

function Toggle({ checked, onChange }) {
    return (
        <label className="inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${checked ? "bg-green-600" : "bg-gray-300"} relative`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transform ${checked ? "translate-x-5" : ""} transition`} />
            </div>
        </label>
    );
}

export default Toggle;
