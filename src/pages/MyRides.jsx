import Header from "../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";

const mockupdata=
    [
  {
    "S.no": 1,
    "Date/Time": "14/9/25 2:30 PM",
    "Cycle-ID": "IOT-042",
    "From": "Library",
    "To": "Shop",
    "Distance": "1km",
    "Ride Time": "10:03",
    "Fare": "₹30.03"
  },
  {
    "S.no": 2,
    "Date/Time": "14/9/25 3:05 PM",
    "Cycle-ID": "IOT-017",
    "From": "Hostel",
    "To": "Canteen",
    "Distance": "1.4km",
    "Ride Time": "08:47",
    "Fare": "₹25.50"
  },
  {
    "S.no": 3,
    "Date/Time": "17/9/25 5:20 PM",
    "Cycle-ID": "IOT-078",
    "From": "Hostel",
    "To": "Canteen",
    "Distance": "1.2km",
    "Ride Time": "09:15",
    "Fare": "₹22.60"
  },
  {
    "S.no": 4,
    "Date/Time": "16/9/25 11:45 AM",
    "Cycle-ID": "IOT-041",
    "From": "Station",
    "To": "Ground",
    "Distance": "3.8km",
    "Ride Time": "18:27",
    "Fare": "₹72.85"
  },
  {
    "S.no": 5,
    "Date/Time": "18/9/25 9:10 AM",
    "Cycle-ID": "IOT-023",
    "From": "Market",
    "To": "Library",
    "Distance": "2.5km",
    "Ride Time": "14:32",
    "Fare": "₹50.40"
  },
  {
    "S.no": 6,
    "Date/Time": "19/9/25 6:50 PM",
    "Cycle-ID": "IOT-056",
    "From": "Canteen",
    "To": "Hostel",
    "Distance": "1.3km",
    "Ride Time": "09:02",
    "Fare": "₹24.10"
  },
  {
    "S.no": 7,
    "Date/Time": "20/9/25 8:25 AM",
    "Cycle-ID": "IOT-034",
    "From": "Library",
    "To": "Station",
    "Distance": "4.1km",
    "Ride Time": "19:14",
    "Fare": "₹78.25"
  },
  {
    "S.no": 8,
    "Date/Time": "20/9/25 1:10 PM",
    "Cycle-ID": "IOT-066",
    "From": "Ground",
    "To": "Market",
    "Distance": "2.9km",
    "Ride Time": "15:47",
    "Fare": "₹55.60"
  },
  {
    "S.no": 9,
    "Date/Time": "21/9/25 7:40 PM",
    "Cycle-ID": "IOT-099",
    "From": "Hostel",
    "To": "Library",
    "Distance": "2.0km",
    "Ride Time": "11:55",
    "Fare": "₹39.20"
  },
  {
    "S.no": 10,
    "Date/Time": "22/9/25 10:15 AM",
    "Cycle-ID": "IOT-012",
    "From": "Station",
    "To": "Canteen",
    "Distance": "3.2km",
    "Ride Time": "17:05",
    "Fare": "₹68.10"
  }
]



const MyRides=()=>{
  const [cycles, setCycles] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/api/cycles/all")
      .then(res => setCycles(res.data))
      .catch(err => console.error(err));
  }, []);
    return(
        <>
        <Header/>
        <div className="min-h-screen bg-[#F9F8E9] pt-20 px-20 font-afacad m-0 ">
              <div className="text-7xl font-bold">My Rides</div>
              <div className="grid grid-cols-8 text-[#016766] text-4xl font-semibold  flex items-center">
                  <div className="p-2">S.no</div>
                  <div className="p-2">Date/Time</div> {/* Fix: P-2 should be p-2 */}
                  <div className="p-2">Cycle-ID</div>
                  <div className="p-2">From</div>
                  <div className="p-2">To</div>
                  <div className="p-2">Distance</div>
                  <div className="p-2">Ride Time</div>
                  <div className="p-2">Fare</div>
              </div>

              {cycles.map(ride => (
              <div key={ride.cycleId} className="grid grid-cols-8  bg-white text-4xl flex items-center border m-4">
                  <div className="p-2">{ride.cycleId}</div>
                  <div className="p-2">{ride.lastSeen}</div>
                  <div className="p-2">{ride.cycleId}</div>
                  <div className="p-2">Station</div>
                  <div className="p-2">Canteen</div>
                  <div className="p-2">3.2Km</div>
                  <div className="p-2">17:05</div>
                  <div className="p-2">68</div>
              </div>
          ))}
        </div>
        </>
    )
}

export default MyRides;