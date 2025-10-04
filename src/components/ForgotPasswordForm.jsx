import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setMsg(""); setError("");
    try {
      const res = await fetch("https://bicycle-locker.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMsg(data.message);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={loading}>Send Reset Link</Button>
      {msg && <Typography color="success.main">{msg}</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}