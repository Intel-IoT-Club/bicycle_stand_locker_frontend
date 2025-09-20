// components/SuccessMessage.jsx
import CheckMark from "../../assets/Check_Mark.png";

const SuccessMessage = () => (
  <div className="flex flex-col items-center text-center font-afacad">
    <img src={CheckMark} alt="Success" />
    <div className="font-bold text-5xl">
      You&apos;ve Arrived at your Destination!
    </div>
    <div className="font-normal text-3xl">
      Please park thoughtfully for the next rider.
    </div>
  </div>
);

export default SuccessMessage;
