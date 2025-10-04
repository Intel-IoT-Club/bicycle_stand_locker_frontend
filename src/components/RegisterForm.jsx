import React, { useState } from "react";
import {
  Box, Button, TextField, InputAdornment, IconButton, Typography, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

const roles = [
  { value: "bicycle_owner", label: "Bicycle Owner" },
  { value: "bicycle_user", label: "Bicycle User" }
];

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Registration API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    if (!role || !name || !email || !password || !confirm) {
      setError("Please fill all fields.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("https://bicycle-locker.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess("Registered! Please sign in.");
      setRole(""); setName(""); setEmail(""); setPassword(""); setConfirm("");
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
        flexGrow: 1,
        justifyContent: "flex-start",
      }}
    >
      <FormControl fullWidth required>
        <InputLabel id="register-role-label">Register as</InputLabel>
        <Select
          labelId="register-role-label"
          id="register-role"
          value={role}
          label="Register as"
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
        label="Full Name"
        variant="outlined"
        required
        fullWidth
        value={name}
        onChange={e => setName(e.target.value)}
        InputProps={{
          sx: { borderRadius: 2 }
        }}
      />
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
      <TextField
        label="Confirm Password"
        type={showConfirm ? "text" : "password"}
        variant="outlined"
        required
        fullWidth
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirm((prev) => !prev)}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showConfirm ? <VisibilityOff /> : <Visibility />}
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
        endIcon={<PersonAddAlt1Icon />}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Account"}
      </Button>
      {error && (
        <Typography variant="body2" color="error" align="center">
          {error}
        </Typography>
      )}
      {success && (
        <Typography variant="body2" color="success.main" align="center">
          {success}
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        sx={{ mt: 1 }}
      >
        By registering, you agree to the Terms of Service.
      </Typography>
    </Box>
  );
};

export default RegisterForm;