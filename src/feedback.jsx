import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import styles from "./complaint.module.css"; 

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
            await axios.post(`${process.env.REACT_APP_API_URL}/api/complaints`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            alert("Your complaint/feedback has been submitted successfully!");
            setFormData({
                name: "",
                email: "",
                issueType: "",
                stationId: "",
                description: "",
            });
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!");
        }
    };

    const toggleFAQ = (index) => {
        setActiveFAQ(activeFAQ === index ? null : index);
    };

    return (
        <div className={styles.containerforfeedb}>
            <motion.div
                className={styles.cardforfeedb}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className={styles.headingforfeedb}>Report an Issue</h2>
                <form onSubmit={handleSubmit} className={styles.formforfeed}>
                    <label className={styles.labelforfeed}>Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.inputforfeed} />

                    <label className={styles.labelforfeed}>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className={styles.inputforfeed} />

                    <label className={styles.labelforfeed}>Issue Type</label>
                    <select name="issueType" value={formData.issueType} onChange={handleChange} required className={styles.selectinputforfeed}>
                        <option value="">Select Issue Type</option>
                        <option value="Damaged Station">Damaged Station</option>
                        <option value="QR Code Not Working">QR Code Not Working</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Other">Other</option>
                    </select>

                    <label className={styles.labelforfeed}>Docking Station ID</label>
                    <input type="text" name="stationId" value={formData.stationId} onChange={handleChange} required className={styles.inputforfeed} />

                    <label className={styles.labelforfeed}>Description</label>
                    <textarea name="description" value={formData.descriptionforfeed} onChange={handleChange} required className={styles.textareaforfeed} />

                    <button type="submit" className={styles.buttonforfeed}>Submit</button>
                </form>
            </motion.div>

            <motion.div
                className={styles.cardforfeedb}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className={styles.headingforfeedb}>Frequently Asked Questions</h2>
                <div className={styles.faqContainerforfeed}>
                    {faqs.map((faq, index) => (
                        <div key={index} className={styles.faqItemforfeed}>
                            <button onClick={() => toggleFAQ(index)} className={styles.faqButtonforfeed}>
                                <span>{faq.question}</span>
                                <span>{activeFAQ === index ? "-" : "+"}</span>
                            </button>
                            <motion.div
                                className={`${styles.faqAnswerforfeed} ${activeFAQ === index ? styles.activeforfeed : ""}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: activeFAQ === index ? 1 : 0, height: activeFAQ === index ? "auto" : 0 }}
                            >
                                {faq.answer}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Complaints;
