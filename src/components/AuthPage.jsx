import React, { useState, useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  useMediaQuery,
  Fade,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { ColorModeContext } from "../main";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";

const blurBg = (theme) =>
  theme.palette.mode === "dark"
    ? alpha("#1A1A1A", 0.5)
    : alpha("#FFFFFF", 0.6);

export default function AuthPage() {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const colorMode = useContext(ColorModeContext);

  // Card flip
  const handleTabChange = (_, newTab) => setTab(newTab);

  // Landing animation
  const [landed, setLanded] = useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setLanded(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
          : "linear-gradient(135deg, #d4e0fc 0%, #f2f6fc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        transition: "background 0.4s",
      }}
    >
      {/* Decorative Glass Circles */}
      <Box
        sx={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 320,
          height: 320,
          background: "rgba(33,150,243,0.22)",
          borderRadius: "50%",
          filter: "blur(64px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 240,
          height: 240,
          background: "rgba(220,0,78,0.16)",
          borderRadius: "50%",
          filter: "blur(72px)",
          zIndex: 0,
        }}
      />

      {/* Theme Toggle */}
      <Tooltip title={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}>
        <IconButton
          onClick={colorMode.toggleColorMode}
          sx={{
            position: "absolute",
            top: 18,
            right: 24,
            bgcolor: blurBg(theme),
            boxShadow: 2,
            zIndex: 20,
            backdropFilter: "blur(12px)",
            border: `1.5px solid ${alpha(theme.palette.divider, 0.12)}`,
            ":hover": { bgcolor: alpha(blurBg(theme), 0.7) },
          }}
          size="large"
        >
          {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>

      {/* Card with landing animation */}
      <Fade in={landed} timeout={800} appear>
        <Paper
          elevation={0}
          sx={{
            width: isMobile ? "100%" : 400,
            maxWidth: "95vw",
            minHeight: 600,
            p: isMobile ? 2 : 4,
            borderRadius: 5,
            boxShadow: "0 8px 40px 8px rgba(25, 118, 210, 0.13)",
            backdropFilter: "blur(24px)",
            background: blurBg(theme),
            border: `1.5px solid ${alpha(theme.palette.divider, 0.15)}`,
            transition: "background 0.3s",
            zIndex: 2,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            fontWeight={700}
            sx={{
              mb: 3,
              color: "primary.main",
              letterSpacing: 2,
              textShadow: theme.palette.mode === "dark"
                ? "0 2px 12px #1976d2"
                : undefined
            }}
          >
            Bicycle Locker
          </Typography>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 2,
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 2
              }
            }}
            centered
          >
            <Tab label="Sign In" />
            <Tab label= "Create Account"/>
          </Tabs>
          {/* Flip Card Effect */}
          <Box
            sx={{
              perspective: 1700,
              minHeight: 370,
              position: "relative",
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                left: 0,
                top: 0,
                transition: "transform 0.7s cubic-bezier(.68,-0.55,.27,1.55)",
                transformStyle: "preserve-3d",
                transform: tab === 1 ? "rotateY(180deg)" : "none",
              }}
            >
              {/* Front (Login) */}
              <Box
                sx={{
                  width: "100%",
                  backfaceVisibility: "hidden",
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
              >
                <LoginForm />
              </Box>
              {/* Back (Register) */}
              <Box
                sx={{
                  width: "100%",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
              >
                <RegisterForm />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
}