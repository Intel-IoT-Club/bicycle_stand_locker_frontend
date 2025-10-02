import Thumbnail from "../assets/Mockup-Bicycle.png"
import { useState, useEffect } from "react";
import axios from "axios";

const NearbyBikes=[
  {
    "time": "01:23PM",
    "duration": "5 min",
    "bike_name": "Trek Domane AL 2",
    "type": "Non-Geared",
    "price": "₹30.03",
    "button": "Start Ride"
  },
  {
    "time": "01:21PM",
    "duration": "10 min",
    "bike_name": "Mach City iBike",
    "type": "Geared",
    "price": "₹45.73",
    "button": "Start Ride"
  },
  {
    "time": "01:31PM",
    "duration": "10 min",
    "bike_name": "Hero Lectro C5",
    "type": "Non-Geared",
    "price": "₹50.21",
    "button": "Start Ride"
  },
  {
    "time": "01:40PM",
    "duration": "15 min",
    "bike_name": "Btwin Rockrider 340",
    "type": "Geared",
    "price": "₹65.10",
    "button": "Start Ride"
  },
  {
    "time": "01:55PM",
    "duration": "7 min",
    "bike_name": "Firefox Rapide",
    "type": "Non-Geared",
    "price": "₹28.45",
    "button": "Start Ride"
  },
  {
    "time": "02:05PM",
    "duration": "20 min",
    "bike_name": "Giant Escape 3",
    "type": "Geared",
    "price": "₹82.30",
    "button": "Start Ride"
  }
]


const BikeUnlock=()=>{
  const [cycles, setCycles] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/api/cycles/all")
      .then(res => {
        console.log("Fetched cycles:", res.data.data);
        setCycles(res.data.data || []);
      })
      .catch(err => {
        console.error(err);
        setCycles([]);
      });
  }, []);
    return(
        <>
        <div className="max-h-screen bg-[#F9F8E9] font-afacad p-20 flex gap-5">
            <div className="flex-1 text-5xl border bg-[#016766] text-white flex items-center justify-center border rounded-2xl border border-2 border-black">MAP</div>
            <div className="flex-1 overflow-auto">
                <div className="bg-black text-4xl text-white font-semibold flex justify-center py-2 rounded-t-2xl">Bicycle Found Near You</div>
                <div className="flex">
                    <div className="bg-[#016766] text-white flex flex-1 justify-center text-3xl border">Sort By</div>
                    <div className="bg-[#016766] text-white flex flex-1 justify-center text-3xl border">Filter By</div>
                </div>
                <div className="text-2xl font-semibold">Chose A Ride</div>
                
               
                        {cycles.map((bike)=>(
                    <div className="bg-white border flex h-auto w-full px-6 gap-5">
                        <div className="flex-1 "><img src={Thumbnail} alt="Bicycle-Thumbnail"/></div>
                        <div className="flex-2 border bg-[#F9F8E9] my-7.5 rounded-xl flex">
                            <div className="flex-3 ">
                                <div className="text-4xl font-semibold">{new Date(bike.lastSeen).toLocaleString("en-IN", {day: "2-digit",month: "2-digit",year: "numeric",hour: "2-digit",minute: "2-digit"})} | 68 min</div>
                                <div className="text-2xl font-semibold">{bike.cycleName}</div>
                                <div className="text-xl ">{bike.type}</div>
                                
                            </div>
                            <div className="flex-2 text-white font-semibold">
                                <div className="bg-black w-auto rounded-sm w-max text-2xl px-4 py-2 relative translate-x-1/4 translate-y-1/4">68₹
                                     <div className="bg-[#016766] rounded-sm w-max text-2xl  px-4 py-2 absolute">Start Ride</div>
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