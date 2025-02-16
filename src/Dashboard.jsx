import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./stylefordash.module.css"; 

const Dashboard = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem("loggedInUser");
        if (!loggedInUser) {
            navigate("/login");
        } else {
            setEmail(loggedInUser);
        }
    }, [navigate]);

    const logout = async () => {
        try {
            await axios.post("/logout", { email });
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("locationId");
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const unlock = async () => {
        try {
            const response = await axios.post("/unlock", { email });
            if (response.data.message === "unlocked") {
                alert("Bicycle unlocked successfully!");
            } else if (response.data.error) {
                alert(`Error: ${response.data.error}`);
            } else {
                alert("Bicycle already unlocked");
            }
        } catch (error) {
            console.error("Error unlocking bicycle:", error);
            alert("Bicycle not locked");
        }
    };

    return (
        <div className={styles.dashboardContainerfordash}>
            <h1 className={styles.containerforr}>Welcome to Dashboard</h1>
            <div className={styles.temporarybuttonflex}>
                <button className={styles.buttonfordashb} onClick={logout}>Logout</button>
                <button className={styles.buttonfordashb} onClick={unlock}>Unlock</button>

            </div>
            </div>
    );
};

export default Dashboard;
