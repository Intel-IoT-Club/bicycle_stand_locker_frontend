import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ComplaintsList.css"; 

const ComplaintsList = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isFetched = useRef(false); 

    useEffect(() => {
        if (isFetched.current) return; 
        isFetched.current = true;

        const fetchComplaints = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/complaints");

                console.log("Fetched complaints:", response.data);
                setComplaints(response.data);
            } catch (error) {
                console.error("Error fetching complaints:", error);
                setError(error.response?.data?.message || "Failed to fetch complaints");
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    return (
        <div className="complaints-container">
            <div className="complaints-wrapper">
                <h1 className="complaints-title">Complaints List</h1>

                {loading ? (
                    <p className="loading-text">Loading complaints...</p>
                ) : error ? (
                    <p className="error-text">{error}</p>
                ) : (
                    <div className="table-container">
                        <table className="complaints-table">
                            <thead>
                                <tr className="table-header">
                                    <th>Issue Type</th>
                                    <th>Docking Station ID</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.length > 0 ? (
                                    complaints.map((complaint, index) => (
                                        <tr key={complaint._id} className={`table-row ${index % 2 === 0 ? "even-row" : "odd-row"}`}>
                                            <td>{complaint.issueType}</td>
                                            <td>{complaint.stationId}</td>
                                            <td>{complaint.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="no-complaints">No complaints found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintsList;
