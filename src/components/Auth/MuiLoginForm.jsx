import React, { useState } from "react";
import {
    Box, Button, TextField, InputAdornment, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, useTheme
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Contexts/authContext";

const roles = [
    { value: "user", label: "Bicycle User" },
    { value: "owner", label: "Bicycle Owner" }
];

const MuiLoginForm = () => {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
        role: "user"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.identifier || !formData.password || !formData.role) {
            setError("Please fill all fields.");
            setLoading(false);
            return;
        }

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL;
            const endpoint = `${apiBase}/api/auth/login`;
            const identifier = formData.identifier.trim();
            let payload = { password: formData.password, role: formData.role };

            if (identifier.includes("@")) {
                payload.email = identifier;
            } else {
                payload.userName = identifier;
            }

            console.log("Submitting login to:", endpoint);
            console.log("Login Payload:", { ...payload, password: "***" });

            const res = await axios.post(endpoint, payload, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = res.data;

            if (data.token && data.user) {
                login(data.token, data.user);
                if (data.user.role === "owner") {
                    navigate("/owner/dashboard");
                } else {
                    navigate("/home");
                }
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.error("Login Error Object:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Login failed";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            autoComplete="off"
            onSubmit={handleSubmit}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                mt: 1,
            }}
        >
            <FormControl fullWidth required>
                <InputLabel id="login-role-label">Login as</InputLabel>
                <Select
                    labelId="login-role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    label="Login as"
                    onChange={handleChange}
                    sx={{ borderRadius: 3 }}
                >
                    {roles.map((r) => (
                        <MenuItem key={r.value} value={r.value}>
                            {r.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Email or Username"
                name="identifier"
                variant="outlined"
                required
                fullWidth
                value={formData.identifier}
                onChange={handleChange}
                InputProps={{
                    sx: { borderRadius: 3 }
                }}
            />

            <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                required
                fullWidth
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword((prev) => !prev)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                }}
            />

            {error && (
                <Typography variant="body2" color="error" align="center" sx={{ fontWeight: 500 }}>
                    {error}
                </Typography>
            )}

            <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                    borderRadius: 3,
                    minHeight: 52,
                    fontWeight: 700,
                    fontSize: "1rem",
                    textTransform: "none",
                    boxShadow: mode === "dark" ? "0 4px 20px rgba(0, 255, 136, 0.3)" : "0 4px 14px 0 rgba(1, 103, 102, 0.3)",
                    ":hover": {
                        boxShadow: mode === "dark" ? "0 6px 25px rgba(0, 255, 136, 0.4)" : "0 6px 20px rgba(1, 103, 102, 0.23)",
                    }
                }}
                endIcon={!loading && <LoginIcon />}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>

            <Typography
                variant="body2"
                align="center"
                sx={{ mt: 1 }}
            >
                <Link to="/forgot-password" style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>
                    <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
                        Forgot password?
                    </Typography>
                </Link>
            </Typography>
        </Box>
    );
};

export default MuiLoginForm;
