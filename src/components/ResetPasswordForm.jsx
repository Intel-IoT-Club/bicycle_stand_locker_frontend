import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPasswordForm() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setMsg(""); setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMsg(data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="New Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={loading}>Reset Password</Button>
      {msg && <Typography color="success.main">{msg}</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}