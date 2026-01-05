import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Fade,
    alpha,
    createTheme,
    ThemeProvider,
    CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const theme = createTheme({
    palette: {
        primary: {
            main: "#016766",
        },
        background: {
            default: "#f4f7fe",
        },
    },
    typography: {
        fontFamily: "'Afacad', sans-serif",
    },
});

const blurBg = (mode) =>
    mode === "dark"
        ? alpha("#0a2e2d", 0.6)
        : alpha("#FFFFFF", 0.8);

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`;
            const res = await axios.post(endpoint, { email });
            setMessage(res.data.message || "Reset link sent to your email!");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minHeight: "100vh",
                    width: "100%",
                    background: "linear-gradient(135deg, #e7f5f2 0%, #F9F8E9 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Glass Circles */}
                <Box
                    sx={{
                        position: "absolute",
                        top: -100,
                        left: -100,
                        width: 300,
                        height: 300,
                        background: "rgba(1, 103, 102, 0.15)",
                        borderRadius: "50%",
                        filter: "blur(60px)",
                        zIndex: 0,
                    }}
                />

                <Fade in={true} timeout={800}>
                    <Paper
                        elevation={0}
                        sx={{
                            width: "100%",
                            maxWidth: 450,
                            p: 5,
                            borderRadius: 6,
                            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
                            backdropFilter: "blur(20px)",
                            background: blurBg("light"),
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            zIndex: 2,
                            textAlign: "center"
                        }}
                    >
                        <Typography variant="h4" fontWeight={800} color="primary" sx={{ mb: 2 }}>
                            Forgot Password?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <TextField
                                label="Email Address"
                                type="email"
                                variant="outlined"
                                required
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />

                            {message && <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>{message}</Typography>}
                            {error && <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>{error}</Typography>}

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{ borderRadius: 3, minHeight: 52, fontWeight: 700, textTransform: "none" }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
                            </Button>

                            <Button
                                variant="text"
                                onClick={() => navigate("/auth")}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                                Back to Login
                            </Button>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </ThemeProvider>
    );
}
