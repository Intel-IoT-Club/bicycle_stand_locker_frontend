import { useState } from "react";
import axios from "axios";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import "./AuthForm.css";
import { useAuth } from "../Contexts/authContext";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    userName: "",
    emailOrIdentifier: "", // used for login (email or username) and signup (email)
    email: "", // used for signup (kept for clarity / API payload)
    password: "",
    rememberMe: false,
    phone: "",
    role: "user", // default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const resetFormAndErrors = (toLogin) => {
    setFormData((prev) => ({
      userName: "",
      emailOrIdentifier: "",
      email: "",
      password: "",
      rememberMe: prev.rememberMe || false,
      phone: "",
      role: "user",
    }));
    setErrors({});
    setIsLogin(toLogin);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (isLogin) {
      if (!formData.emailOrIdentifier)
        newErrors.emailOrIdentifier = "Email or username is required";
      if (!formData.password) newErrors.password = "Password is required";
      if (!formData.role) newErrors.role = "Role is required";
    } else {
      // signup validation
      if (!formData.userName) newErrors.userName = "Username is required";
      if (!formData.email && !formData.emailOrIdentifier)
        newErrors.email = "Email is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (!formData.role) newErrors.role = "Role is required";
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password && formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const endpoint = isLogin
        ? `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`
        : `${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`;

      // Build payload depending on login/signup and identifier type
      let payload;
      if (isLogin) {
        const identifier = formData.emailOrIdentifier.trim();
        // If it looks like an email, send email; otherwise send userName
        if (identifier.includes("@")) {
          payload = { email: identifier, password: formData.password };
        } else {
          payload = { userName: identifier, password: formData.password };
        }
        // include role and rememberMe for login
        payload.role = formData.role;
        if (formData.rememberMe) payload.rememberMe = true;
      } else {
        // Signup: allow either email placed in emailOrIdentifier OR the explicit email field
        const emailToSend = formData.email.trim() || formData.emailOrIdentifier.trim();
        payload = {
          userName: formData.userName.trim(),
          email: emailToSend,
          password: formData.password,
          phone: formData.phone.trim(),
          role: formData.role,
        };
      }

      const res = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data;

      if (data.token && data.user) {
        login(data.token, data.user);
      }

      navigate("/home");
      // optionally redirect: window.location.href = "/dashboard";
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({
          submit: error.response.data.message || "Something went wrong",
        });
      } else {
        setErrors({ submit: "Network error. Try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p className="text-muted">
            {isLogin ? "Log in to access your dashboard" : "Join us to get started"}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${isLogin ? "active" : ""}`}
            onClick={() => resetFormAndErrors(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn ${!isLogin ? "active" : ""}`}
            onClick={() => resetFormAndErrors(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Signup-only: Username */}
          {!isLogin && (
            <div className={`form-group ${errors.userName ? "error" : ""}`}>
              <label htmlFor="userName">Username</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
              {errors.userName && (
                <span className="error-message">{errors.userName}</span>
              )}
            </div>
          )}

          {/* Email or Email/Username field */}
          <div
            className={`form-group ${
              (isLogin ? errors.emailOrIdentifier : (errors.email || errors.emailOrIdentifier)) ? "error" : ""
            }`}
          >
            <label htmlFor="emailOrIdentifier">
              <EnvelopeIcon className="input-icon" />
              {isLogin ? "Email or Username" : "Email Address"}
            </label>
            <input
              type="text"
              id="emailOrIdentifier"
              name="emailOrIdentifier"
              value={formData.emailOrIdentifier}
              onChange={handleChange}
              placeholder={isLogin ? "you@domain.com or username" : "your@email.com"}
              required
            />
            {!isLogin && (
              <>
                <small className="muted">You can also fill the separate Email field below.</small>
                <div style={{ height: 6 }} />
              </>
            )}
            {isLogin && errors.emailOrIdentifier && (
              <span className="error-message">{errors.emailOrIdentifier}</span>
            )}
            {!isLogin && errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Optional explicit email for signup */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Confirm / Enter Email (optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>
          )}

          {/* Signup-only: phone */}
          {!isLogin && (
            <div className={`form-group ${errors.phone ? "error" : ""}`}>
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          )}

          {/* Role (both login and signup) */}
          <div className={`form-group ${errors.role ? "error" : ""}`}>
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="owner">Owner</option>
            </select>
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          <div className={`form-group ${errors.password ? "error" : ""}`}>
            <label htmlFor="password">
              <LockClosedIcon className="input-icon" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isLogin ? "Enter your password" : "Create a password (min 8 chars)"}
              required
              minLength={isLogin ? 6 : 8}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            {isLogin && (
              <a href="/forgot-password" className="forgot-password">
                Forgot password?
              </a>
            )}
          </div>

          {errors.submit && <div className="submit-error">{errors.submit}</div>}

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <ArrowPathIcon className="animate-spin" />
                Processing...
              </>
            ) : isLogin ? (
              "Log In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              Not a member?{" "}
              <button
                type="button"
                className="text-link"
                onClick={() => resetFormAndErrors(false)}
              >
                Sign up now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="text-link"
                onClick={() => resetFormAndErrors(true)}
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
