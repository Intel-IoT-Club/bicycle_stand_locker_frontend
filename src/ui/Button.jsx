// components/Button.jsx
const Button = ({ children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 flex-1 bg-black text-white rounded-md text-2xl relative overflow-hidden cursor-pointer text-center"
    >
      {children}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-25 transition-opacity rounded-md"></div>
    </div>
  );
};

export default Button;
