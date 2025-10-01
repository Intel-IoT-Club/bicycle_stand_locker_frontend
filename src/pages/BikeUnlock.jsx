import Thumbnail from "../assets/Mockup-Bicycle.png"
import Dropdown from "../components/BikeUnlock/DropDown"

const NearbyBikes = [
  {
    time: "01:23PM",
    duration: "5 min",
    bike_name: "Trek Domane AL 2",
    type: "Non-Geared",
    price: "₹30.03",
    button: "Start Ride",
  },
  {
    time: "01:21PM",
    duration: "10 min",
    bike_name: "Mach City iBike",
    type: "Geared",
    price: "₹45.73",
    button: "Start Ride",
  },
  {
    time: "01:31PM",
    duration: "10 min",
    bike_name: "Hero Lectro C5",
    type: "Non-Geared",
    price: "₹50.21",
    button: "Start Ride",
  },
  {
    time: "01:40PM",
    duration: "15 min",
    bike_name: "Btwin Rockrider 340",
    type: "Geared",
    price: "₹65.10",
    button: "Start Ride",
  },
  {
    time: "01:55PM",
    duration: "7 min",
    bike_name: "Firefox Rapide",
    type: "Non-Geared",
    price: "₹28.45",
    button: "Start Ride",
  },
  {
    time: "02:05PM",
    duration: "20 min",
    bike_name: "Giant Escape 3",
    type: "Geared",
    price: "₹82.30",
    button: "Start Ride",
  },
]

const BikeUnlock = () => {
  return (
    <>
      <div className="max-h-screen bg-[#F9F8E9] font-afacad p-20 flex gap-5">
        <div className="flex-1 text-5xl border bg-[#016766] text-white flex items-center justify-center rounded-2xl border-2 border-black">
          MAP
        </div>

        <div className="flex-1 overflow-auto">
          <div className="bg-black text-4xl text-white font-semibold flex justify-center py-2 rounded-t-2xl">
            Bicycle Found Near You
          </div>

          <div className="flex justify-between items-center p-2">
            <Dropdown options={["raghav", "chirag", "ak"]} title={"Sort By"} />
            <div className="bg-[#016766] text-white flex justify-center text-3xl border py-2 px-4 cursor-pointer rounded-lg">
              Filter By
            </div>
          </div>

          <div className="text-2xl font-semibold mt-4">Choose A Ride</div>

          {NearbyBikes.map((bike, index) => (
            <div
              key={index}
              className="bg-white border flex h-auto w-full px-6 gap-5 my-4 py-4 rounded-xl"
            >
              <div className="flex-1">
                <img src={Thumbnail} alt="Bicycle-Thumbnail" />
              </div>

              <div className="flex-[2] border bg-[#F9F8E9] rounded-xl flex p-4">
                <div className="flex-[3]">
                  <div className="text-4xl font-semibold">
                    {bike.time} | {bike.duration}
                  </div>
                  <div className="text-2xl font-semibold">{bike.bike_name}</div>
                  <div className="text-xl">{bike.type}</div>
                </div>

                <div className="flex-[2] text-white font-semibold flex flex-col items-end justify-center gap-2">
                  <div className="bg-black rounded-sm w-max text-2xl px-4 py-2">
                    {bike.price}
                  </div>
                  <div className="bg-[#016766] rounded-sm w-max text-2xl px-4 py-2 cursor-pointer">
                    {bike.button}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default BikeUnlock
