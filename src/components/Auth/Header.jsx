const Header = () => {
  return (
    <div className="flex justify-between px-5 items-center w-full h-12 bg-black text-white">
      <div>Logo</div>
      <div className="flex gap-x-10">
        <div>Home</div>
        <div>My Rides</div>
        <div>Wallet</div>
        <div>Avatar</div>
      </div>
    </div>
  );
};

export default Header;
