import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./QRCodeStream.module.css";

const QRCodeStream = () => {
    const [qrCodes, setQrCodes] = useState([]);
    const [error, setError] = useState(null);

    const fetchQRCodes = async () => {
        console.log("API URL:", process.env.REACT_APP_API_URL);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/stream`);
            console.log("Response Data:", response.data); 
            setQrCodes(response.data);
        } catch (error) {
            console.error("Error fetching QR codes:", error);
            setError("Failed to load QR codes. Please try again later.");
        }
    };

    useEffect(() => {
        fetchQRCodes();
        const intervalId = setInterval(fetchQRCodes, 5000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={styles.qrcontainerforurall}>
            <div className={styles.qrContentWrapper}>
                <h1>Live QR Code Stream</h1>
                {error && <p className="error">{error}</p>}
                <div className="qr-list">
                    {qrCodes.length > 0 ? (
                        qrCodes.map((qr) => (
                            <div key={qr._id} className={styles.qrItem}>
                                <p><strong>Location ID:</strong> {qr.locationid}</p>
                                <p><strong>Timestamp:</strong> {new Date(qr.timestamp).toLocaleString()}</p>
                                {qr.qrData && qr.qrData.startsWith("data:image") ? (
                                    <img src={qr.qrData} alt={`QR Code for ${qr.locationid}`} className={styles.qrImage} />
                                ) : (
                                    <p>Invalid QR Data</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No QR codes available.</p>
                    )}
                </div>
            </div>
        </div>

    );
};

export default QRCodeStream;