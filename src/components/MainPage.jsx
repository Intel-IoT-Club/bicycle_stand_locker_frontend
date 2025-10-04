import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetch("https://bicycle-locker.onrender.com/api/main", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setError("Session expired. Please login again.");
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) return <Typography align="center" sx={{ mt: 6 }}>Loading...</Typography>;
  if (error) return <Typography align="center" color="error" sx={{ mt: 6 }}>{error}</Typography>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #d4e0fc 0%, #f2f6fc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, borderRadius: 5, minWidth: 340, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Bicycle Locker Main Page
        </Typography>
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1" gutterBottom>
          You are logged in as: <b>{user?.role === "bicycle_owner" ? "Bicycle Owner" : "Bicycle User"}</b>
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          sx={{ mt: 4 }}
        >
          Logout
        </Button>
      </Paper>
    </Box>
  );
}