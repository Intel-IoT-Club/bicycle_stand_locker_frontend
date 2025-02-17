import React, { useState } from "react";
import axios from "axios";
import "./complaint.css";

const Complaints = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        issueType: "",
        stationId: "",
        description: "",
    });

    const [activeFAQ, setActiveFAQ] = useState(null);

    const faqs = [
        { question: "What if my bike is stolen?", answer: "Contact support immediately." },
        { question: "How to report a damaged docking station?", answer: "Use the report issue button on the dashboard." },
        { question: "Can I reserve a docking station?", answer: "Currently, reservations are not supported." },
        { question: "What payment methods are accepted?", answer: "We accept credit cards and UPI." },
        { question: "How to reset my password?", answer: "Go to the login page and click on Forgot Password." },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:3000/api/complaints", formData, {
                headers: { "Content-Type": "application/json" },
            });
            alert("Your complaint/feedback has been submitted successfully!");
            setFormData({ name: "", email: "", issueType: "", stationId: "", description: "" });
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!");
        }
    };

    const toggleFAQ = (index) => {
        setActiveFAQ(activeFAQ === index ? null : index);
    };

    return (
        <div className="feedback-container">
            <div className="feedback-card">
                <h2 className="feedback-title">Report an Issue</h2>
                <form onSubmit={handleSubmit} className="feedback-form">
                    <label className="feedback-label">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="feedback-input" />

                    <label className="feedback-label">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="feedback-input" />

                    <label className="feedback-label">Issue Type</label>
                    <select name="issueType" value={formData.issueType} onChange={handleChange} required className="feedback-select">
                        <option value="">Select Issue Type</option>
                        <option value="Damaged Station">Damaged Station</option>
                        <option value="QR Code Not Working">QR Code Not Working</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Other">Other</option>
                    </select>

                    <label className="feedback-label">Docking Station ID</label>
                    <input type="text" name="stationId" value={formData.stationId} onChange={handleChange} required className="feedback-input" />

                    <label className="feedback-label">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required className="feedback-textarea" />

                    <button type="submit" className="feedback-submit">Submit</button>
                </form>
            </div>

            <div className="faq-card">
                <h2 className="faq-title">Frequently Asked Questions</h2>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div key={index} className="faq-item" onClick={() => toggleFAQ(index)}>
                            <button className="faq-button">
                                <span>{faq.question}</span>
                                <span className="faq-icon">{activeFAQ === index ? "−" : "+"}</span>
                            </button>
                            <div className={`faq-answer ${activeFAQ === index ? "active" : ""}`}>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Complaints;
