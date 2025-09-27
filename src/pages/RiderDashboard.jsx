import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Container
} from "@mui/material";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";

// Simulated bicycle data
const ALL_BICYCLES = [
  { id: 1, owner: "Alice", status: "available" },
  { id: 2, owner: "Bob", status: "unavailable" },
  { id: 3, owner: "Charlie", status: "available" }
];

const RiderDashboard = () => {
  const [bicycles, setBicycles] = useState([]);

  useEffect(() => {
    // In real app, fetch available bicycles from backend
    setBicycles(ALL_BICYCLES.filter(b => b.status === "available"));
  }, []);

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={5} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          <DirectionsBikeIcon color="primary" sx={{ mr: 1 }} />
          Rider Dashboard
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Available Bicycles
        </Typography>
        {bicycles.length === 0 ? (
          <Typography>No bicycles available or currently unavailable.</Typography>
        ) : (
          <List>
            {bicycles.map(b => (
              <ListItem key={b.id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <DirectionsBikeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Owner: ${b.owner}`}
                  secondary={`Status: ${b.status}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default RiderDashboard;