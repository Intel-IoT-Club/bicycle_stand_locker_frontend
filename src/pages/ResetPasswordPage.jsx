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
    CircularProgress,
    InputAdornment,
    IconButton
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, useParams } from "react-router-dom";
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

export default function ResetPasswordPage() {
    const { token: urlToken } = useParams();
    const [token, setToken] = useState(urlToken || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`;
            const res = await axios.post(endpoint, { token, password });
            setMessage(res.data.message || "Password reset successful!");
            setTimeout(() => navigate("/auth"), 2000);
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
                            Reset Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Enter your new password below.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {!urlToken && (
                                <TextField
                                    label="Reset Token"
                                    required
                                    fullWidth
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    InputProps={{ sx: { borderRadius: 3 } }}
                                />
                            )}

                            <TextField
                                label="New Password"
                                type={showPassword ? "text" : "password"}
                                required
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 3 }
                                }}
                            />

                            <TextField
                                label="Confirm New Password"
                                type={showPassword ? "text" : "password"}
                                required
                                fullWidth
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Update Password"}
                            </Button>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </ThemeProvider>
    );
}
