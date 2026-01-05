import UnlockIcon from "../../assets/Unlock_Icon.png";
import LocationIcon from "../../assets/Location_Icon.png";
import CardWallet from "../../assets/Card_Wallet_Icon.png";
import BarChart from "../../assets/Bar_Chart_Icon.png";

const AboutUs = () => {
  return (
    <>
      <div id="about-us" className="bg-[#F9F8E9] font-afacad min-h-screen m-0">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#016766] to-[#101010] text-center py-6">
          <h2 className="text-5xl lg:text-8xl font-bold text-white">About Us</h2>
        </div>

        {/* Content */}
        <div className="flex-1 w-full px-6 lg:px-24 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-0">
          {/* Left Section */}
          <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left gap-y-6 lg:gap-y-8 lg:pr-24">
            <h3 className="font-bold text-4xl lg:text-7xl leading-tight">
              Connecting Our Campus, Faster
            </h3>
            <p className="font-normal text-xl lg:text-3xl text-gray-700">
              We are a team of innovators from the IoT Club dedicated to
              building a smart, sustainable future. Our Bicycle Rental Project
              leverages IoT and cloud technology to make commuting convenient,
              secure, and eco-friendly by reducing manual effort and providing a
              seamless user experience.
            </p>
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-18 justify-center items-center">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#016766] p-6 lg:p-9 rounded-full hover:scale-105 transition shadow-lg">
                <img src={UnlockIcon} className="h-12 w-12 lg:h-18 lg:w-18" />
              </div>
              <p className="font-semibold text-2xl lg:text-3xl mt-4">Tap & Ride Access</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#016766] p-6 lg:p-9 rounded-full hover:scale-105 transition shadow-lg">
                <img src={LocationIcon} className="h-12 w-12 lg:h-18 lg:w-18" />
              </div>
              <p className="font-semibold text-2xl lg:text-3xl mt-4">Live Bike Map</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#016766] p-6 lg:p-9 rounded-full hover:scale-105 transition shadow-lg">
                <img src={CardWallet} className="h-12 w-12 lg:h-18 lg:w-18" />
              </div>
              <p className="font-semibold text-2xl lg:text-3xl mt-4">Effortless Payments</p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#016766] p-6 lg:p-9 rounded-full hover:scale-105 transition shadow-lg">
                <img src={BarChart} className="h-12 w-12 lg:h-18 lg:w-18" />
              </div>
              <p className="font-semibold text-2xl lg:text-3xl mt-4">Ride Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
