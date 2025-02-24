import { useState } from "react";
import axios from "axios";
import styles from "./QRCodeGenerator.module.css"; 

const QRCodeGenerator = () => {
    const [locationId, setLocationId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const generateQRCode = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        if (!locationId.trim()) {
            setError("Location ID cannot be empty.");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/generate`, { locationid: locationId });

            if (response.status === 200 || response.status === 201) {
                setMessage("Successfully Generated. Thank you!");
            } else {
                setMessage("QR Code generated but response was unexpected.");
            }
        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;
                setError(
                    status === 409
                        ? `Location ID "${locationId}" already exists.`
                        : data.message || "Something went wrong. Please try again."
                );
            } else {
                setError("Failed to connect to the server. Please try again.");
            }
        }
    };

    return (
        <div className={styles.containerforgenqr}>
            <h1 className={styles.titleforgenqr}>Generate QR Code</h1>
            <form onSubmit={generateQRCode} className={styles.formforgenqr}>
                <label htmlFor="locationid" className={styles.labelforgenqr}>Location ID:</label>
                <input
                    type="text"
                    id="locationid"
                    name="locationid"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    required
                    className={styles.inputforgenqr}
                />
                <button type="submit" className={styles.buttonforgenqr}>Generate QR Code</button>
            </form>
            {message && <h2 className={`${styles.messageforgenqr} ${styles.successforgenqr}`}>{message}</h2>}
            {error && <h2 className={`${styles.messageforgenqr} ${styles.errorforgenqr}`}>{error}</h2>}
            <div className={styles.backgroundforgenqr}></div>
        </div>
    );
};

export default QRCodeGenerator;
