import UnlockIcon from "../../assets/Unlock_Icon.png";
import LocationIcon from "../../assets/Location_Icon.png";
import CardWallet from "../../assets/Card_Wallet_Icon.png";
import BarChart from "../../assets/Bar_Chart_Icon.png";

const AboutUs = () => {
  return (
    <>
      <div className="bg-[#F9F8E9] font-afacad min-h-screen m-0">
        {/* Header */}
        <div className="bg-gradient-to-b  from-[#016766] from-[#024A48]  via-[#082323] to-[#101010] text-center py-6">
          <h2 className="text-8xl font-bold text-white">About Us</h2>
        </div>

        {/* Content */}
        <div className="flex-1 w-full px-24 py-24 grid grid-cols-1 lg:grid-cols-2 items-cente BORDERr">
          {/* Left Section */}
          <div className="flex flex-col justify-center items-center  gap-y-8 px-24 py-12 ">
            <h3 className="font-bold text-7xl">
              Connecting Our Campus, Faster
            </h3>
            <p className="font-normal text-3xl">
              We are a team of innovators from the IoT Club dedicated to
              building a smart, sustainable future. Our Bicycle Rental Project
              leverages IoT and cloud technology to make commuting convenient,
              secure, and eco-friendly by reducing manual effort and providing a
              seamless user experience.
            </p>
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-2 gap-18 justify-center items-center px-24">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#016766] p-9 rounded-full hover:scale-105 transition">
                <img src={UnlockIcon} className="h-18 w-18" />
              </div>
              <p className="font-semibold text-3xl">Tap & Ride Access</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#016766] p-9 rounded-full hover:scale-105 transition">
                <img src={LocationIcon} className="h-18 w-18" />
              </div>
              <p className="font-semibold text-3xl">Live Bike Map</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#016766] p-9 rounded-full hover:scale-105 transition">
                <img src={CardWallet} className="h-18 w-18" />
              </div>
              <p className="font-semibold text-3xl">Effortless Payments</p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#016766] p-9 rounded-full hover:scale-105 transition">
                <img src={BarChart} className="h-18 w-18" />
              </div>
              <p className="font-semibold text-3xl">Ride Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
