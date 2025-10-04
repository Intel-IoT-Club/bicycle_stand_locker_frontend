export default function OutlineButton({ children, className = "", ...props }) {
    return (
        <button {...props} className={`px-3 py-2 rounded-lg border bg-white ${className}`}>
            {children}
        </button>
    );
}