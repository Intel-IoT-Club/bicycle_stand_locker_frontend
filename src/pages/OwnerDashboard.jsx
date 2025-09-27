import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  Divider,
  Stack
} from "@mui/material";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const OwnerDashboard = () => {
  // Simulate state; in real app, fetch from backend
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRiding, setIsRiding] = useState(false);
  const [fareStatus, setFareStatus] = useState("No active rides");

  const handleToggleAvailable = () => {
    setIsAvailable((prev) => !prev);
    if (!isAvailable) {
      setIsRiding(false);
      setFareStatus("No active rides");
    }
  };

  const handleSimulateRide = () => {
    setIsRiding(true);
    setIsAvailable(false);
    setFareStatus("Fare running: ₹20");
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={5} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          <DirectionsBikeIcon color="primary" sx={{ mr: 1 }} />
          Owner Dashboard
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">Riding Status:</Typography>
          <Typography
            color={
              isRiding
                ? "warning.main"
                : isAvailable
                  ? "success.main"
                  : "text.secondary"
            }
            variant="h6"
          >
            {isRiding ? "In Use" : isAvailable ? "Available" : "Unavailable"}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <MonetizationOnIcon color="secondary" />
          <Typography variant="h6">Fare Status:</Typography>
          <Typography>{fareStatus}</Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Switch
            checked={isAvailable}
            onChange={handleToggleAvailable}
            disabled={isRiding}
            color="primary"
          />
          <Typography>Bicycle Free to Use</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleSimulateRide}
            disabled={isRiding || !isAvailable}
          >
            Simulate Start Ride
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setIsRiding(false);
              setFareStatus("No active rides");
            }}
            disabled={!isRiding}
          >
            Simulate End Ride
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

import Container from "@mui/material/Container";
export default OwnerDashboard;