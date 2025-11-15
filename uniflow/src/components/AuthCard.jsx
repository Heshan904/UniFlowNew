import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import UniflowLogo from "../assets/uniflow-logo.png";
import "./auth.css";

const WARDEN_EMAIL = "skavinda742@gmail.com";
const WARDEN_PASSWORD = "shehan";
const DOCTOR_EMAIL = "skavinda771@gmail.com";
const DOCTOR_PASSWORD = "kavinda";
const HOSTAL_EMAIL = "hostal@gmail.com";
const HOSTAL_PASSWORD = "hostal";
const CANTEEN_EMAIL = "canteen@gmail.com";
const CANTEEN_PASSWORD = "canteen";
const MEDICAL_EMAIL = "medical@gmail.com";
const MEDICAL_PASSWORD = "medical";

const formCopy = {
  login: {
    title: "Welcome Back",
    subtitle: "Sign in to continue managing your campus experience.",
    actionText: "Login",
    togglePrompt: "Don't have an account?",
    toggleLabel: "Sign Up",
    nextState: "signup",
  },
  signup: {
    title: "Create Account",
    subtitle: "Join Uniflow and stay connected with your campus community.",
    actionText: "Sign Up",
    togglePrompt: "Already have an account?",
    toggleLabel: "Login",
    nextState: "login",
  },
};

const defaultLogin = { email: "", password: "" };
const defaultSignup = { name: "", email: "", password: "" };

function AuthCard({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [loginValues, setLoginValues] = useState(defaultLogin);
  const [signupValues, setSignupValues] = useState(defaultSignup);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const copy = useMemo(() => formCopy[mode], [mode]);

  const handleToggle = () => {
    setFeedback("");
    setMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  const handleToggleKey = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");

    const { email, password } = loginValues;
    const isWarden = email === WARDEN_EMAIL && password === WARDEN_PASSWORD;
    const isDoctor = email === DOCTOR_EMAIL && password === DOCTOR_PASSWORD;
    const isHostal = email === HOSTAL_EMAIL && password === HOSTAL_PASSWORD;
    const isCanteen = email === CANTEEN_EMAIL && password === CANTEEN_PASSWORD;
    const isMedical = email === MEDICAL_EMAIL && password === MEDICAL_PASSWORD;

    try {
      let fullName = "";
      if (!isWarden && !isDoctor && !isHostal && !isCanteen && !isMedical) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        fullName = userCredential.user?.displayName?.trim() || "";
      }
      const role = isWarden
        ? "warden"
        : isDoctor
        ? "doctor"
        : isHostal
        ? "hostal"
        : isCanteen
        ? "canteen"
        : isMedical
        ? "medical-admin"
        : "student";
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userPassword", password);
      if (fullName) {
        localStorage.setItem("userFullName", fullName);
      }
      setFeedback("Login successful!");
      onAuthSuccess?.(role);

      let destination = "/dashboard";
      if (role === "warden") {
        destination = "/warden";
      } else if (role === "doctor") {
        destination = "/doctor";
      } else if (role === "hostal") {
        destination = "/hostal";
      } else if (role === "canteen") {
        destination = "/canteen-admin";
      } else if (role === "medical-admin") {
        destination = "/medical-admin";
      }

      navigate(destination, { replace: true });
    } catch (error) {
      localStorage.clear();
      setFeedback("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");

    const { name, email, password } = signupValues;

    try {
      const trimmedName = name.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: trimmedName });
      localStorage.setItem("userFullName", trimmedName);
      localStorage.setItem("userPassword", password);
      localStorage.setItem("userRole", "student");
      setFeedback("Signup successful! You can now login.");
      setSignupValues(defaultSignup);
      setMode("login");
      setLoginValues({ email, password: "" });
    } catch (error) {
      setFeedback(error.message || "Unable to create account right now.");
    } finally {
      setSubmitting(false);
    }
  };

  // 👉 Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setFeedback("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const displayName = user.displayName || "";
      const email = user.email || "";

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("email", email);
      localStorage.setItem("userFullName", displayName);
      localStorage.setItem("userRole", "student");
      localStorage.setItem("role", "student");

      setFeedback("Google sign-in successful!");
      onAuthSuccess?.("student");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFeedback(error.message || "Google sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`auth-card auth-card--login slide-fade ${mode}`}>
      <div className="auth-card__brand">
        <img src={UniflowLogo} alt="Uniflow Logo" className="auth-card__logo" />
      </div>
      <h2 className="auth-card__title">{copy.title}</h2>
      <p className="auth-card__subtitle">{copy.subtitle}</p>

      {mode === "login" ? (
        <form key="login" className="auth-card__form slide-fade" onSubmit={handleLoginSubmit}>
          <label className="auth-card__field">
            <span>Email</span>
            <input
              className="auth-card__input"
              type="email"
              name="email"
              placeholder="student@example.com"
              value={loginValues.email}
              onChange={handleLoginChange}
              required
            />
          </label>
          <label className="auth-card__field">
            <span>Password</span>
            <input
              className="auth-card__input"
              type="password"
              name="password"
              placeholder="********"
              value={loginValues.password}
              onChange={handleLoginChange}
              required
            />
          </label>
          <button className="auth-card__submit" type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : copy.actionText}
          </button>

          {/* Google Sign-In Section */}
          <p className="auth-card__toggle">
            {copy.togglePrompt}{" "}
            <span
              onClick={handleToggle}
              onKeyDown={handleToggleKey}
              role="button"
              tabIndex={0}
            >
              {copy.toggleLabel}
            </span>
          </p>
          <hr />
          <div className="google-signin">
            <button
              type="button"
              className="auth-card__google"
              onClick={handleGoogleSignIn}
              disabled={submitting}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="google-icon"
              />
              Sign up with Google
            </button>
          </div>
        </form>
      ) : (
        <form key="signup" className="auth-card__form slide-fade" onSubmit={handleSignupSubmit}>
          <label className="auth-card__field">
            <span>Full Name</span>
            <input
              className="auth-card__input"
              type="text"
              name="name"
              placeholder="Your name"
              value={signupValues.name}
              onChange={handleSignupChange}
              required
            />
          </label>
          <label className="auth-card__field">
            <span>Email</span>
            <input
              className="auth-card__input"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={signupValues.email}
              onChange={handleSignupChange}
              required
            />
          </label>
          <label className="auth-card__field">
            <span>Password</span>
            <input
              className="auth-card__input"
              type="password"
              name="password"
              placeholder="Create a password"
              value={signupValues.password}
              onChange={handleSignupChange}
              required
            />
          </label>
          <button className="auth-card__submit" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : copy.actionText}
          </button>

          <p className="auth-card__toggle">
            {copy.togglePrompt}{" "}
            <span
              onClick={handleToggle}
              onKeyDown={handleToggleKey}
              role="button"
              tabIndex={0}
            >
              {copy.toggleLabel}
            </span>
          </p>
        </form>
      )}

      {feedback && <p className="auth-card__feedback">{feedback}</p>}
    </div>
  );
}

export default AuthCard;
