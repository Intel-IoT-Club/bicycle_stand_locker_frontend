import React, { useState } from "react";
import {
    Box, Button, TextField, InputAdornment, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, useTheme
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import axios from "axios";

const roles = [
    { value: "user", label: "Bicycle User" },
    { value: "owner", label: "Bicycle Owner" }
];

const MuiRegisterForm = ({ onSuccess }) => {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        phone: "",
        password: "",
        role: "user"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!formData.userName || !formData.email || !formData.phone || !formData.password || !formData.role) {
            setError("Please fill all fields.");
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters.");
            setLoading(false);
            return;
        }

        try {
            const endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`;
            const payload = {
                userName: formData.userName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone.trim(),
                role: formData.role,
            };

            const res = await axios.post(endpoint, payload);
            setSuccess("Account created successfully! Please sign in.");

            // Clear form
            setFormData({
                userName: "",
                email: "",
                phone: "",
                password: "",
                role: "user"
            });

            if (onSuccess) {
                setTimeout(() => onSuccess(), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Registration failed");
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
                gap: 2,
                mt: 1,
            }}
        >
            <FormControl fullWidth required size="small">
                <InputLabel id="register-role-label">Register as</InputLabel>
                <Select
                    labelId="register-role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    label="Register as"
                    onChange={handleChange}
                    sx={{ borderRadius: 2.5 }}
                >
                    {roles.map((r) => (
                        <MenuItem key={r.value} value={r.value}>
                            {r.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Username"
                name="userName"
                variant="outlined"
                required
                fullWidth
                size="small"
                value={formData.userName}
                onChange={handleChange}
                InputProps={{
                    sx: { borderRadius: 2.5 }
                }}
            />

            <TextField
                label="Email Address"
                name="email"
                type="email"
                variant="outlined"
                required
                fullWidth
                size="small"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                    sx: { borderRadius: 2.5 }
                }}
            />

            <TextField
                label="Phone Number"
                name="phone"
                type="tel"
                variant="outlined"
                required
                fullWidth
                size="small"
                value={formData.phone}
                onChange={handleChange}
                InputProps={{
                    sx: { borderRadius: 2.5 }
                }}
            />

            <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                required
                fullWidth
                size="small"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword((prev) => !prev)}
                                edge="end"
                                size="small"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5 }
                }}
            />

            {error && (
                <Typography variant="caption" color="error" align="center" sx={{ fontWeight: 600 }}>
                    {error}
                </Typography>
            )}

            {success && (
                <Typography variant="caption" color="success.main" align="center" sx={{ fontWeight: 600 }}>
                    {success}
                </Typography>
            )}

            <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                    borderRadius: 2.5,
                    minHeight: 48,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: mode === "dark" ? "0 4px 20px rgba(0, 255, 136, 0.2)" : "0 4px 12px rgba(1, 103, 102, 0.2)",
                    mt: 1
                }}
                endIcon={!loading && <PersonAddAlt1Icon />}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
            </Button>

            <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                sx={{ mt: 0.5, px: 2 }}
            >
                By creating an account, you agree to our Terms and Conditions.
            </Typography>
        </Box>
    );
};

export default MuiRegisterForm;
