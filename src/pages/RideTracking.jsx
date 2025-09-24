import MapPin from "../assets/Map_Pin.png";

const RideData = {
  bike_id: "IOT-042",
  bike_name: "Trek Domane Al 2 (Non Geared)",
  from: "Library",
  to: "Shop",
  ride_time: "8:45",
  time_left: "3:04",
  dist_left: "0.3km",
  dist_covered: "0.7km",
  price: "₹30.03"
};

const RideTracking = () => {
  return (
    <div className="min-h-screen bg-[#F9F8E9] font-afacad flex flex-col items-center p-10">

        {/* Bike ID + Name */}
        <div className="pb-6">
            <div className="text-6xl font-bold text-center">
                Bike ID: {RideData.bike_id}
            </div>
            <div className="text-4xl text-center">
                {RideData.bike_name}
            </div>
        </div>

        <div className="flex flex-row gap-36">
      {/* Left Side - MAP */}
      <div className="flex-1 flex items-center justify-center bg-[#016766] rounded-xl border-2 border-black px-48 py-36">
        <div>
            <img src={MapPin} className="h-96 w-84" />
        </div>
      </div>

      {/* Right Side - Ride Info */}
      <div className="flex-1 flex flex-col items-center gap-6">
        

        {/* From - To */}
        <div className="bg-black text-white text-3xl rounded-xl px-6 py-4 w-140">
          <div>From: {RideData.from}</div>
          <div>To: {RideData.to}</div>
        </div>

        {/* Ride Stats */}
        <div className="flex justify-center items-center gap-36 relative mt-18">
          {/* Ride Time */}
          <div className="bg-black text-white text-3xl rounded-full w-48 h-48 flex flex-col items-center justify-center z-20">
            <div>Ride Time</div>
            <div className="text-5xl font-bold">{RideData.ride_time}</div>
          </div>

          {/* Time Left (center, slightly up) */}
          <div className="bg-[#016766] text-white text-3xl rounded-full w-48 h-48 flex flex-col items-center justify-center absolute top-[-50px] left-1/2 transform -translate-x-1/2 z-10">
            <div>Time Left</div>
            <div className="text-5xl font-bold">{RideData.time_left}</div>
          </div>

          {/* Dist. Left */}
          <div className="bg-black text-white text-3xl rounded-full w-48 h-48 flex flex-col items-center justify-center ml-auto z-10">
            <div>Dist. Left</div>
            <div className="text-5xl font-bold">{RideData.dist_left}</div>
          </div>
        </div>

        {/* Distance + Fare */}
        <div className="bg-[#016766] text-white text-center px-6 py-3 rounded-lg">
            <div className="text-2xl">Dist. Covered: {RideData.dist_covered} </div>
            <div className="text-4xl">Est. Fare: {RideData.price}</div>          
        </div>

        {/* End Ride Button */}
        <div className="bg-red-600 hover:bg-red-700 text-white text-4xl font-bold px-36 py-6 rounded-lg">
          END RIDE
        </div>
      </div>
      </div>
    </div>
  );
};

export default RideTracking;
