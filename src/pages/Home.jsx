import HomeCycle from "../assets/Home_cycle.png";
import SearchIcon from "../assets/Search_icon.png";
import Header from "../components/Auth/header";

const Home = () => {
  return (
    <>
      <Header />
      <div className="h-auto bg-[#F9F8E9] pt-30 px-48 font-afacad m-0">
        <div className="flex justify-between">
          <div className="flex flex-col gap-y-8 w-1/3 ">
            <div className="font-bold text-8xl ">Request A Ride</div>
            <div className="p-4 bg-[#787880]/16 rounded-4xl text-base pl-6 flex gap-x-4 items-center">
              <div>
                <img src={SearchIcon} className="h-8 w-8" />
              </div>
              <div className="text-xl">Enter Boarding Point</div>
            </div>

            <div className="p-4 bg-[#787880]/16 rounded-4xl text-base pl-6 flex  gap-x-4 items-center">
              <div>
                <img src={SearchIcon} className="h-8 w-8" />
              </div>
              <div className="text-xl">Enter Destination Point</div>
            </div>

            <div className="flex w-full gap-8 text-center">
              <div className="p-4 flex-1 bg-[#016766] text-white rounded-md text-2xl relative overflow-hidden cursor-pointer">
                About us
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-25  transition-opacity rounded-md"></div>
              </div>

              <div className="p-4 flex-1 bg-[#000000] text-white rounded-md text-2xl relative overflow-hidden cursor-pointer">
                Search Rides
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-25 transition-opacity rounded-md"></div>
              </div>
            </div>
          </div>

          <div className="w-1/2">
            <img src={HomeCycle} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
