import React from "react";

const RideSummaryCard = ({ details }) => {
  return (
    <div className="bg-[#016766] text-white rounded-lg px-8 pt-6 pb-8 mt-8 w-full text-left font-afacad text-3xl">
      <div className="font-bold">Ride Summary</div>
      <div className="pt-4 grid grid-cols-2 gap-y-2 text-2xl">
        {details.map(([label, value], idx) => (
          <React.Fragment key={idx}>
            <p>{label}</p>
            <p className="text-right">{value}</p>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RideSummaryCard;
