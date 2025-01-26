const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const path = require("path");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// Handle QR code scan logic
app.get("/scan", async (req, res) => {
    const { email, locationId, bicycleId } = req.query;

    // If no email or bicycleId, assume a browser request and serve scan.html
    if (!email || !bicycleId) {
        return res.sendFile(path.join(__dirname, "scan.html"));
    }

    // API logic for handling `/scan`
    try {
        const existingStatus = await Status.findOne({ email, bicycleId });

        if (!existingStatus) {
            const newStatus = new Status({
                email,
                status: "locked",
                bicycleId,
                locationId,
            });
            await newStatus.save();
            return res.json({ message: "locked" });
        }

        if (existingStatus.status === "locked") {
            if (existingStatus.locationId === locationId) {
                return res.json({ message: "already locked" });
            } else {
                return res.json({
                    message: `${bicycleId} is locked in ${existingStatus.locationId}`,
                });
            }
        }

        if (existingStatus.status === "unlocked") {
            existingStatus.status = "locked";
            existingStatus.locationId = locationId;
            existingStatus.timestamp = Date.now();
            await existingStatus.save();
            return res.json({ message: "locked" });
        }

        return res.status(400).json({ error: "Unknown status." });
    } catch (error) {
        console.error("Error in /scan endpoint:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose.connect("mongodb+srv://qrcode:qrcode@webprojone.gsnljtb.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Schema and Model
const qrSchema = new mongoose.Schema({
    locationid: String,
    qrData: String,
    timestamp: { type: Date, default: Date.now },
});
const QRImage = mongoose.model("QRImage", qrSchema);

// Real-time update setup
const clients = [];

// Routes
// Handle root path
app.get("/", (req, res) => {
    res.send("wrong path");
});

// Serve genqr.html
app.get("/genqr.html", (req, res) => {
    res.sendFile(path.join(__dirname, "genqr.html"));
});

// Serve scan.html

// Serve allqr.html
app.get("/allqr", (req, res) => {
    res.sendFile(path.join(__dirname, "allqr.html"));
});

// Handle QR Code generation
app.post("/generate", async (req, res) => {
    const { locationid } = req.body;
    const qrURL = `${req.protocol}://${req.get("host")}/scan?locationid=${encodeURIComponent(locationid)}`;
    const qrData = await QRCode.toDataURL(qrURL);

    // Save to database
    const newQR = new QRImage({ locationid, qrData });
    await newQR.save();

    // Notify all connected clients
    clients.forEach(client => client.res.write(`data: ${JSON.stringify([newQR])}\n\n`));

    res.json({ locationid, qrData });
});

// Real-time updates for all QR Codes
app.get("/stream", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    clients.push({ id: Date.now(), res });

    // Send all existing QR codes initially
    const qrImages = await QRImage.find();
    res.write(`data: ${JSON.stringify(qrImages)}\n\n`);

    req.on("close", () => {
        clients.splice(clients.indexOf(req), 1);
    });
});
const signupSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    bicycleId: String,
    timestamp: { type: Date, default: Date.now },
});
const Signup = mongoose.model("Signup", signupSchema);

const loginSchema = new mongoose.Schema({
    email: String,
    timestamp: { type: Date, default: Date.now },
    status: String,
});
const Login = mongoose.model("Login", loginSchema);

// Routes
// Serve login.html
app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// Serve dashboard.html
app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Handle signup
app.post("/signup", async (req, res) => {
    const { firstName, lastName, email, password, reenterPassword, bicycleId } = req.body;

    if (password !== reenterPassword) {
        return res.status(400).json({ error: "Passwords do not match." });
    }

    const existingUser = await Signup.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: "Email is already registered." });
    }

    const newUser = new Signup({ firstName, lastName, email, password, bicycleId });
    await newUser.save();
    res.json({ message: "Signup successful!, please login " });
});

// Handle login
// Handle login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await Signup.findOne({ email, password });
    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    const newLogin = new Login({ email, status: "logged in" });
    await newLogin.save();

    // Check if locationId is passed from scan.html
    const locationId = req.body.locationId; // If locationId exists in the request body
    if (locationId) {
        return res.json({ message: "Login successful!", email, locationId });
    }

    res.json({ message: "Login successful!", email });
});
// Middleware to check if the user is logged in
function checkLogin(req, res, next) {
    const email = req.body.email || req.query.email || req.headers['x-user-email'];

    if (!email || !localStorage.getItem('loggedInUser')) {
        return res.status(403).json({ error: "You must be logged in to access this page." });
    }

    next();
}


// Handle logout
app.post("/logout", async (req, res) => {
    const { email } = req.body;
    await Login.updateOne({ email, status: "logged in" }, { status: "logged out" });
    res.json({ message: "Logout successful!" });
});
// Handle fetching bicycle ID for a logged-in user
app.get("/getBicycleId", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        console.error("Missing email in /getBicycleId");
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        const user = await Signup.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json({ bicycleId: user.bicycleId });
    } catch (error) {
        console.error("Error in /getBicycleId endpoint:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});



//complaint
// Serve feed.html
app.get("/feed", (req, res) => {
    res.sendFile(path.join(__dirname, "feed.html"));
});
// Serve the dispcomp HTML page
app.get("/dispcomp", (req, res) => {
    res.sendFile(path.join(__dirname, "dispcomp.html"));
});
const complaintSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    issueType: { type: String, required: true },
    stationId: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

const Complaint = mongoose.model("Complaint", complaintSchema);

app.post("/api/complaints", async (req, res) => {
    const { name, email, issueType, stationId, description } = req.body;

    try {
        const complaint = new Complaint({
            name,
            email,
            issueType,
            stationId,
            description,
        });

        await complaint.save();
        res.status(201).json({ message: "Complaint submitted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to submit complaint.",
            error: error.message
        });
    }
});
// Get All Complaints
app.get("/api/complaints", async (req, res) => {
    try {
        const complaints = await Complaint.find(); // Fetch all complaints from MongoDB
        res.status(200).json(complaints);
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ success: false, message: "Failed to fetch complaints" });
    }
});
// Define the statuses schema
const statusesSchema = new mongoose.Schema({
    email: { type: String, required: true },
    status: { type: String, required: true }, // "locked" or "unlocked"
    bicycleId: { type: String, required: true },
    locationId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Status = mongoose.model("Status", statusesSchema);

app.post("/unlock", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        const existingStatus = await Status.findOne({ email });

        if (!existingStatus) {
            return res.status(404).json({ error: "No bicycle found for this user." });
        }

        if (existingStatus.status === "unlocked") {
            return res.json({ message: "Bicycle is already unlocked." });
        }

        // Update the status to 'unlocked'
        existingStatus.status = "unlocked";
        await existingStatus.save();

        return res.json({ message: "unlocked" });
    } catch (error) {
        console.error("Error in /unlock endpoint:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});



const PORT = process.env.PORT || 3000;
console.log(`Listening on port: ${PORT}`);
const HOST = process.env.HOST || '0.0.0.0'; // Binding to 0.0.0.0
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
