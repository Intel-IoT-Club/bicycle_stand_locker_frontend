import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    useMediaQuery,
    Fade,
    alpha,
    createTheme,
    ThemeProvider,
    IconButton,
    Tooltip
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MuiLoginForm from "./MuiLoginForm";
import MuiRegisterForm from "./MuiRegisterForm";

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: {
            main: mode === "dark" ? "#00ff88" : "#016766",
        },
        background: {
            default: mode === "dark" ? "#000000" : "#F9F8E9",
        },
    },
    typography: {
        fontFamily: "'Afacad', sans-serif",
    },
});

const blurBg = (mode) =>
    mode === "dark"
        ? alpha("#000000", 0.8)
        : alpha("#FFFFFF", 0.8);

export default function MuiAuthPage() {
    const [mode, setMode] = useState("light");
    const theme = getTheme(mode);
    const [tab, setTab] = useState(0);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleTabChange = (_, newTab) => setTab(newTab);

    const [landed, setLanded] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setLanded(true), 100);
        return () => clearTimeout(t);
    }, []);

    const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minHeight: "100vh",
                    width: "100%",
                    background: mode === "dark"
                        ? "radial-gradient(circle at center, #0a1f1a 0%, #000000 100%)"
                        : "linear-gradient(135deg, #e7f5f2 0%, #F9F8E9 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    position: "relative",
                    overflow: "hidden",
                    transition: "background 0.3s ease",
                }}
            >
                {/* Theme Toggle Button */}
                <Tooltip title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}>
                    <IconButton
                        onClick={toggleMode}
                        sx={{
                            position: "absolute",
                            top: 24,
                            right: 24,
                            bgcolor: mode === "dark" ? "rgba(0, 255, 136, 0.05)" : "rgba(1, 103, 102, 0.05)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid",
                            borderColor: mode === "dark" ? "rgba(0, 255, 136, 0.2)" : "rgba(1, 103, 102, 0.1)",
                            zIndex: 10,
                            ":hover": {
                                bgcolor: mode === "dark" ? "rgba(0, 255, 136, 0.1)" : "rgba(1, 103, 102, 0.1)",
                            }
                        }}
                    >
                        {mode === "dark" ? <LightModeIcon sx={{ color: "#00ff88" }} /> : <DarkModeIcon sx={{ color: "#016766" }} />}
                    </IconButton>
                </Tooltip>

                {/* Glass Circles */}
                <Box
                    sx={{
                        position: "absolute",
                        top: -100,
                        left: -100,
                        width: 300,
                        height: 300,
                        background: mode === "dark" ? "rgba(0, 255, 136, 0.07)" : "rgba(1, 103, 102, 0.15)",
                        borderRadius: "50%",
                        filter: "blur(80px)",
                        zIndex: 0,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: -80,
                        right: -80,
                        width: 250,
                        height: 250,
                        background: mode === "dark" ? "rgba(0, 255, 136, 0.05)" : "rgba(1, 103, 102, 0.1)",
                        borderRadius: "50%",
                        filter: "blur(100px)",
                        zIndex: 0,
                    }}
                />

                <Fade in={landed} timeout={800}>
                    <Paper
                        elevation={0}
                        sx={{
                            width: isMobile ? "100%" : 450,
                            maxWidth: "500px",
                            minHeight: 600,
                            p: isMobile ? 3 : 5,
                            borderRadius: 6,
                            boxShadow: mode === "dark"
                                ? "0 0 50px rgba(0, 255, 136, 0.1), 0 20px 80px rgba(0, 0, 0, 0.8)"
                                : "0 12px 40px rgba(0, 0, 0, 0.1)",
                            backdropFilter: "blur(30px)",
                            background: blurBg(mode),
                            border: "1px solid",
                            borderColor: mode === "dark" ? "rgba(0, 255, 136, 0.2)" : "rgba(255, 255, 255, 0.3)",
                            zIndex: 2,
                            display: "flex",
                            flexDirection: "column",
                            color: mode === "dark" ? "#ffffff" : "inherit",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                    >
                        <Typography
                            variant="h4"
                            align="center"
                            fontWeight={800}
                            color="primary"
                            sx={{
                                mb: 1,
                                letterSpacing: -0.5,
                                textShadow: mode === "dark" ? "0 0 20px rgba(0, 255, 136, 0.5)" : "none",
                            }}
                        >
                            Amrita Bicycle Rental System
                        </Typography>
                        <Typography
                            variant="body2"
                            align="center"
                            color="text.secondary"
                            sx={{ mb: 4, fontWeight: 500 }}
                        >
                            Secure your ride with intelligence
                        </Typography>

                        <Tabs
                            value={tab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            sx={{
                                mb: 4,
                                bgcolor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                                borderRadius: 3,
                                p: 0.5,
                                "& .MuiTabs-indicator": {
                                    height: "100%",
                                    borderRadius: 2.5,
                                    bgcolor: mode === "dark" ? "rgba(255,255,255,0.1)" : "white",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                },
                                "& .MuiTab-root": {
                                    zIndex: 1,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderRadius: 2.5,
                                    minHeight: 44,
                                    transition: "color 0.2s",
                                    color: mode === "dark" ? "rgba(255,255,255,0.5)" : "text.secondary",
                                    "&.Mui-selected": {
                                        color: mode === "dark" ? "#fff" : "primary.main",
                                    },
                                },
                            }}
                        >
                            <Tab label="Sign In" />
                            <Tab label="Sign Up" />
                        </Tabs>

                        {/* 3D Flip Content Container */}
                        <Box sx={{
                            flexGrow: 1,
                            perspective: "1000px",
                            position: "relative",
                            minHeight: 400,
                        }}>
                            <Box sx={{
                                width: "100%",
                                height: "100%",
                                transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                                transformStyle: "preserve-3d",
                                transform: tab === 0 ? "rotateY(0deg)" : "rotateY(180deg)",
                                position: "relative",
                            }}>
                                {/* Front Side (Login) */}
                                <Box sx={{
                                    width: "100%",
                                    backfaceVisibility: "hidden",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                }}>
                                    <MuiLoginForm />
                                </Box>

                                {/* Back Side (Signup) */}
                                <Box sx={{
                                    width: "100%",
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                }}>
                                    <MuiRegisterForm onSuccess={() => setTab(0)} />
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </ThemeProvider>
    );
}
