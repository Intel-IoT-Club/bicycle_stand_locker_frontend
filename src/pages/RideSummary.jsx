import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Header from "../components/Header";
import SuccessMessage from "../components/RideSummary/SuccessMsg";
import RideSummaryCard from "../components/RideSummary/RideSummaryCard";
import Button from "../ui/Button";

const RideSummary = () => {
  const { id } = useParams(); // rideId
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/rides/${id}/get`
        );
        setRide(res.data.ride);
      } catch (err) {
        console.error("Failed to fetch ride:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [id]);

  if (loading) return <div className="pt-32 text-center">Loading...</div>;
  if (!ride) return <div className="pt-32 text-center">Ride not found</div>;

  // Helpers
  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const formatDuration = (min) =>
    min ? `${Math.floor(min)} min` : "—";

  const formatDistance = (km) =>
    km ? `${km.toFixed(2)} km` : "—";

  const rideDetails = [
    ["Date & Time:", formatDateTime(ride.startedAt)],
    ["Ride Time:", formatDuration(ride.finalDurationMin || ride.timeMin)],
    ["Distance Covered:", formatDistance(ride.finalDistanceKm || ride.distanceKm)],
    ["Fare (₹):", ride.finalFare?.toFixed(2)],
    [
      "Start Location:",
      ride.boarding?.coordinates
        ? `${ride.boarding.coordinates[1]}, ${ride.boarding.coordinates[0]}`
        : "—",
    ],
    [
      "Drop Location:",
      ride.destination?.coordinates
        ? `${ride.destination.coordinates[1]}, ${ride.destination.coordinates[0]}`
        : "—",
    ],
    ["Payment Method:", ride.payment?.method || "—"],
    ["Transaction ID:", ride.payment?.txnId || "—"],
  ];

  /* ---------------- INVOICE DOWNLOAD ---------------- */
  const handleDownloadInvoice = () => {
    if (!ride) return;

    const doc = new jsPDF();

    // -- BRANDING / HEADER --
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(1, 103, 102); // #016766
    doc.text("PedalAccess", 14, 20);

    // Invoice Label
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("RIDE INVOICE", 14, 28);

    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // -- RIDE META --
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);

    const dateStr = formatDateTime(ride.startedAt);
    const rideIdShort = ride._id.slice(-8).toUpperCase();

    doc.text(`Ride ID: #${rideIdShort}`, 14, 40);
    doc.text(`Date: ${dateStr}`, 14, 46);

    // -- TABLE DATA --
    // We can reuse the `rideDetails` formatting logic by defining helpers or just accessing them
    const tableData = [
      ["Item", "Details"],
      ["Bike", ride.bikeName || ride.cycleName || "Bicycle"],
      ["Start Location", ride.boarding?.coordinates ? `${ride.boarding.coordinates[1]}, ${ride.boarding.coordinates[0]}` : "—"],
      ["End Location", ride.destination?.coordinates ? `${ride.destination.coordinates[1]}, ${ride.destination.coordinates[0]}` : "—"],
      ["Duration", formatDuration(ride.finalDurationMin || ride.timeMin)],
      ["Distance", formatDistance(ride.finalDistanceKm || ride.distanceKm)],
      ["Payment Method", ride.payment?.method || "Online"],
      ["Transaction ID", ride.payment?.txnId || "—"]
    ];

    // -- TABLE --
    autoTable(doc, {
      startY: 55,
      head: [], // No header needed for key-value pairs, or we can use one
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 11, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      headStyles: { fillColor: [1, 103, 102] }
    });

    // -- TOTAL FARE SECTION --
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Fare:`, 130, finalY);

    doc.setFontSize(16);
    doc.setTextColor(1, 103, 102);
    doc.text(`INR ${ride.finalFare?.toFixed(2) || "0.00"}`, 160, finalY);

    // -- FOOTER --
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    doc.text("Thank you for riding with PedalAccess!", 14, finalY + 30);
    doc.text("If you have any questions, contact support@pedalaccess.com", 14, finalY + 35);

    // Save
    doc.save(`Invoice_${rideIdShort}.pdf`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F9F8E9] pt-20 px-6 lg:px-48 font-afacad m-0 pb-10">
        <div className="flex flex-col lg:flex-row justify-center">
          <div className="flex flex-col gap-y-6 lg:gap-y-8 w-full lg:w-1/2 items-center">
            {/* Sub header */}
            <SuccessMessage />

            {/* Ride Summary */}
            <RideSummaryCard details={rideDetails} />

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row w-full gap-4 lg:gap-8">
              <Button>Wallet</Button>
              <Button onClick={handleDownloadInvoice}>Download Invoice</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RideSummary;
