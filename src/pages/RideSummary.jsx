import Header from "../components/Header";
import SuccessMessage from "../components/RideSummary/SuccessMsg";
import RideSummaryCard from "../components/RideSummary/RideSummaryCard";
import Button from "../ui/Button";

const RideSummary = () => {
  const rideDetails = [
    ["Date & Time:", "14 Sep 2025, 2:30PM"],
    ["Ride Time:", "10:03"],
    ["Distance Covered:", "1 km"],
    ["Fare (₹):", "30.03"],
    ["Start Location:", "Library"],
    ["Drop Location:", "Shop"],
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F9F8E9] pt-18 px-48 font-afacad m-0">
        <div className="flex flex-row justify-around">
          <div className="flex flex-col gap-y-8 w-1/2 items-center">
            {/* Sub header*/}
            <SuccessMessage />

            {/* Ride Summary */}
            <RideSummaryCard details={rideDetails} />

            {/* Buttons */}
            <div className="flex w-4/5 gap-8">
              <Button>Wallet</Button>
              <Button>Download Invoice</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RideSummary;
