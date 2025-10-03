import React, { useState } from "react";
import {
  Box, Button, TextField, InputAdornment, IconButton, Typography, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate } from "react-router-dom";

const roles = [
  { value: "bicycle_owner", label: "Bicycle Owner" },
  { value: "bicycle_user", label: "Bicycle User" }
];

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Login API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    if (!role || !email || !password) {
      setError("Please fill all fields.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      navigate("/main");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
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
      <FormControl fullWidth required>
        <InputLabel id="login-role-label">Login as</InputLabel>
        <Select
          labelId="login-role-label"
          id="login-role"
          value={role}
          label="Login as"
          onChange={e => setRole(e.target.value)}
          sx={{ borderRadius: 2 }}
        >
          {roles.map((r) => (
            <MenuItem key={r.value} value={r.value}>
              {r.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        required
        fullWidth
        value={email}
        onChange={e => setEmail(e.target.value)}
        InputProps={{
          sx: { borderRadius: 2 }
        }}
      />
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        variant="outlined"
        required
        fullWidth
        value={password}
        onChange={e => setPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
          sx: { borderRadius: 2 }
        }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        sx={{
          borderRadius: 2,
          minHeight: 48,
          fontWeight: 600,
          boxShadow: "0 2px 12px rgba(25, 118, 210, 0.12)",
        }}
        endIcon={<LoginIcon />}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      {error && (
        <Typography variant="body2" color="error" align="center">
          {error}
        </Typography>
      )}
      <Typography
  variant="caption"
  color="text.secondary"
  align="center"
  sx={{ mt: 1 }}
>
  <a href="/forgot-password" style={{ color: "#1976d2", textDecoration: "underline" }}>
    Forgot password?
  </a>
</Typography>
    </Box>
  );
};

export default LoginForm;