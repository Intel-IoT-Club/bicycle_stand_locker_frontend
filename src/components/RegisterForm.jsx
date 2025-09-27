import React, { useState } from "react";
import {
  Box, Button, TextField, InputAdornment, IconButton, Typography
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Box
      component="form"
      autoComplete="off"
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
    >
      <TextField
        label="Full Name"
        variant="outlined"
        required
        fullWidth
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
          mt: 1,
          minHeight: 48,
          fontWeight: 600,
          boxShadow: "0 2px 12px rgba(25, 118, 210, 0.12)"
        }}
        endIcon={<PersonAddAlt1Icon />}
      >
        Register
      </Button>
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