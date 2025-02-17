import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./BicycleStatus.css";

const BicycleStatus = () => {
    const [bicycleId, setBicycleId] = useState("Loading Bicycle ID...");
    const [statusMessage, setStatusMessage] = useState("Loading status...");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchBicycleInfo = async () => {
            const locationId = searchParams.get("locationid");
            if (!locationId) {
                setBicycleId("Location ID missing in URL!");
                return;
            }

            const email = localStorage.getItem("loggedInUser");
            if (!email) {
                navigate(`/login?redirect=${encodeURIComponent(window.location.href)}`);
                return;
            }

            try {
                const { data } = await axios.get(`/getBicycleId`, { params: { email } });

                if (data.bicycleId) {
                    setBicycleId(`Roll Number: ${data.bicycleId}`);
                    const newUrl = `/scan?email=${email}&locationid=${locationId}&bicycleId=${data.bicycleId}`;
                    navigate(newUrl, { replace: true });

                    fetchScanStatus(email, data.bicycleId, locationId);
                } else {
                    setBicycleId("No Bicycle ID found for the user.");
                }
            } catch (error) {
                setBicycleId("Error loading Bicycle ID.");
            }
        };

        const fetchScanStatus = async (email, bicycleId, locationId) => {
            try {
                const { data } = await axios.get(`/scan`, { params: { email, locationId, bicycleId } });

                setStatusMessage(data.message ? `Status: ${data.message}` : "No status available.");
            } catch (error) {
                setStatusMessage("Error fetching status.");
            }
        };

        fetchBicycleInfo();
    }, [searchParams, navigate]);

    return (
        <div className="backgroundforscane">
            {}
            <div className="animation-containerforscane">
                <div className="circle circle1"></div>
                <div className="circle circle2"></div>
                <div className="circle circle3"></div>
            </div>

            {}
            <div className="status-containerforscan">
                <h1>Bicycle Status</h1>
                <p>{bicycleId}</p>
                <p>{statusMessage}</p>
            </div>
        </div>
    );
};

export default BicycleStatus;
