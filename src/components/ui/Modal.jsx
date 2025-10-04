
import React from 'react';

function Modal({ open, onClose, title, footer, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full sm:w-[560px] bg-white rounded-t-xl sm:rounded-xl shadow-lg overflow-hidden mx-4">
                {title && <div className="p-4 border-b"><h3 className="text-lg font-semibold">{title}</h3></div>}
                <div className="p-4 max-h-[70vh] overflow-auto">{children}</div>
                {footer && <div className="p-4 border-t">{footer}</div>}
            </div>
        </div>
    );
}

export default Modal;
