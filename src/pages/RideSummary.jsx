import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Header from "../components/Header";
import SuccessMessage from "../components/RideSummary/SuccessMsg";
import RideSummaryCard from "../components/RideSummary/RideSummaryCard";
import Button from "../ui/Button";
import { useAuth } from "../components/Contexts/authContext";

const RideSummary = () => {
  const { id } = useParams(); // rideId
  const { token } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/rides/${id}/get`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRide(res.data.ride);
      } catch (err) {
        console.error("Failed to fetch ride:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [id, token]);

  if (loading) return (
    <div className="min-h-screen bg-[#F9F8E9] flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-8 border-black border-t-[#016766] rounded-full animate-spin mb-6"></div>
      <h2 className="text-3xl font-black uppercase italic tracking-tighter">Preparing Summary...</h2>
    </div>
  );

  if (!ride) return (
    <div className="min-h-screen bg-[#F9F8E9] flex flex-col items-center justify-center p-4">
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="text-3xl font-black uppercase italic tracking-tighter">Ride Not Found</h2>
    </div>
  );

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const formatDuration = (min) =>
    min ? `${Math.floor(min)}m` : "—";

  const formatDistance = (km) =>
    km ? `${km.toFixed(2)}km` : "—";

  const rideDetails = [
    ["Date", formatDateTime(ride.startedAt)],
    ["Bike", ride.bikeName || "Bicycle"],
    ["Travel", formatDuration(ride.finalDurationMin || ride.timeMin)],
    ["Distance", formatDistance(ride.finalDistanceKm || ride.distanceKm)],
    ["Paid", `₹${ride.finalFare?.toFixed(2)}`],
    ["Method", ride.payment?.method || "—"],
    ["Txn ID", ride.payment?.txnId?.slice(-8) || "—"],
  ];

  const handleDownloadInvoice = () => {
    if (!ride) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(1, 103, 102);
    doc.text("Amrita BRS", 14, 20);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("RIDE INVOICE", 14, 28);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);
    const tableData = [
      ["Item", "Details"],
      ["Bike", ride.bikeName || ride.cycleName || "Bicycle"],
      ["Duration", formatDuration(ride.finalDurationMin || ride.timeMin)],
      ["Distance", formatDistance(ride.finalDistanceKm || ride.distanceKm)],
      ["Total Fare", `INR ${ride.finalFare?.toFixed(2)}`],
      ["Payment", ride.payment?.method || "Wallet"],
      ["Txn ID", ride.payment?.txnId || "—"]
    ];
    autoTable(doc, {
      startY: 40,
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [1, 103, 102] }
    });
    doc.save(`Invoice_${ride._id.slice(-8)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F9F8E9] font-afacad pb-20">
      <Header />

      <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

          {/* Header Banner */}
          <div className="bg-black text-white p-8 lg:p-12 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#016766] rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#016766] rounded-full blur-3xl"></div>
            </div>

            <div className="inline-block bg-[#016766] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-4 border-2 border-white/20">
              Ride Completed
            </div>
            <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter mb-2">
              Journey <span className="text-[#016766]">Receipt</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Thank you for riding with us!</p>
          </div>

          <div className="p-6 lg:p-12">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-gray-50 p-4 rounded-3xl border-2 border-black flex flex-col items-center text-center">
                <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Time</div>
                <div className="text-2xl font-black italic">{formatDuration(ride.finalDurationMin || ride.timeMin)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-3xl border-2 border-black flex flex-col items-center text-center">
                <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Distance</div>
                <div className="text-2xl font-black italic">{formatDistance(ride.finalDistanceKm || ride.distanceKm)}</div>
              </div>
              <div className="bg-[#016766]/10 p-4 rounded-3xl border-2 border-[#016766] flex flex-col items-center text-center">
                <div className="text-[10px] font-black uppercase text-[#016766]/60 mb-1">Total Fare</div>
                <div className="text-2xl font-black italic text-[#016766]">₹{ride.finalFare?.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-3xl border-2 border-black flex flex-col items-center text-center">
                <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Status</div>
                <div className="text-sm font-black uppercase text-green-600">Paid</div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="space-y-4 mb-12">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4 italic">Ride Details</h3>
              <div className="bg-gray-50 rounded-3xl border-2 border-black divide-y-2 divide-black/5 overflow-hidden">
                {rideDetails.map(([label, value], idx) => (
                  <div key={idx} className="flex justify-between p-4 lg:p-5">
                    <span className="text-xs font-black uppercase text-gray-400">{label}</span>
                    <span className="font-bold text-sm lg:text-base">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadInvoice}
                className="flex-1 bg-[#016766] text-white py-5 rounded-2xl text-xl font-black uppercase italic border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Download PDF
              </button>
              <button
                onClick={() => window.location.href = '/wallet'}
                className="flex-1 bg-white text-black py-5 rounded-2xl text-xl font-black uppercase italic border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                View Wallet
              </button>
            </div>

            <button
              onClick={() => window.location.href = '/home'}
              className="w-full mt-4 text-gray-400 font-black uppercase text-xs tracking-[0.2em] hover:text-black transition-colors py-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default RideSummary;
