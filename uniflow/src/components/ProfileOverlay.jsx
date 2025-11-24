import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { db } from "../firebase"; // make sure firebase is initialized
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import "./profileOverlay.css";
import unknownAvatar from "../assets/unknown-avatar.svg";

const DEFAULT_AVATAR = unknownAvatar;

const YEAR_OPTIONS = ["First Year", "Second Year", "Third Year", "Fourth Year"];

const ROLE_KEYS = {
  student: {
    fields: [
      { key: "userFullName", label: "Full Name", type: "text" },
      { key: "userYear", label: "Year", type: "select", options: YEAR_OPTIONS },
      { key: "userID", label: "Student ID", type: "text" },
      { key: "userPhone", label: "Phone Number", type: "text" },
      { key: "userAddress", label: "Address", type: "textarea" },
    ],
    required: ["userProfilePhoto", "userFullName", "userYear", "userID", "userPhone", "userAddress"],
  },
  warden: {
    fields: [
      { key: "userFullName", label: "Full Name", type: "text" },
      { key: "wardAdminId", label: "Administrator ID", type: "text" },
      { key: "wardPhone", label: "Phone Number", type: "text" },
      { key: "wardEmail", label: "Primary Email", type: "text" },
    ],
    required: ["userFullName", "wardAdminId", "wardPhone", "wardEmail"],
  },
  doctor: {
    fields: [
      { key: "userFullName", label: "Full Name", type: "text" },
      { key: "docAdminId", label: "Administration ID", type: "text" },
      { key: "docPhone", label: "Phone Number", type: "text" },
      { key: "docEmail", label: "Primary Email", type: "text" },
    ],
    required: ["userFullName", "docAdminId", "docPhone", "docEmail"],
  },
};

const ALL_KEYS = Array.from(
  new Set(["userFullName", "userProfilePhoto"].concat(...Object.values(ROLE_KEYS).map((role) => role.fields.map((f) => f.key))))
);

const DEFAULT_STATE = ALL_KEYS.reduce((acc, key) => ({ ...acc, [key]: "" }), {});

function readProfilePhoto() {
  try {
    return localStorage.getItem("userProfilePhoto") || "";
  } catch {
    return "";
  }
}

const ProfileOverlay = ({ onClose, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [role, setRole] = useState("student");
  const [profileValues, setProfileValues] = useState(DEFAULT_STATE);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacyMessage, setPrivacyMessage] = useState({ type: "", text: "" });

  // For testing: use a default UID (replace with firebase auth UID later)
  const userId = localStorage.getItem("userId") || "defaultUser";

  // Load stored profile
  useEffect(() => {
    const storedRole = (localStorage.getItem("userRole") || "student").toLowerCase();
    setRole(["student", "warden", "doctor"].includes(storedRole) ? storedRole : "student");

    const nextValues = { ...DEFAULT_STATE };
    ALL_KEYS.forEach((key) => {
      try {
        const value = localStorage.getItem(key);
        if (value) nextValues[key] = value;
      } catch {}
    });

    setProfileValues(nextValues);
    setProfilePhoto(readProfilePhoto());
  }, []);

  const trimmedName = useMemo(() => profileValues.userFullName.trim(), [profileValues.userFullName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name.toLowerCase().includes("phone")) {
      const cleaned = value.replace(/[^\d+]/g, "");
      nextValue = cleaned.startsWith("+")
        ? `+${cleaned.slice(1).replace(/\+/g, "")}`.slice(0, 16)
        : cleaned.replace(/\+/g, "").slice(0, 15);
    }
    setProfileValues((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFeedback({ type: "", text: "" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFieldErrors({ ...fieldErrors, userProfilePhoto: "Unsupported image format." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      localStorage.setItem("userProfilePhoto", result);
      setProfilePhoto(result);
      setProfileValues((prev) => ({ ...prev, userProfilePhoto: result }));
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.userProfilePhoto;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const validateByRole = () => {
    const trimmed = Object.fromEntries(
      Object.entries(profileValues).map(([key, val]) => [key, (val || "").trim()])
    );

    if (role === "student") {
      if (!trimmed.userProfilePhoto) return { key: "userProfilePhoto", message: "Profile photo required." };
      if (!trimmed.userFullName) return { key: "userFullName", message: "Full name required." };
      if (!trimmed.userYear) return { key: "userYear", message: "Year required." };
      if (!trimmed.userID) return { key: "userID", message: "Student ID required." };
      if (!/^07\d{8}$/.test(trimmed.userPhone)) return { key: "userPhone", message: "Invalid phone number." };
      if (!trimmed.userAddress || trimmed.userAddress.length < 10)
        return { key: "userAddress", message: "Complete address required." };
    }

    if (role === "warden") {
      if (!trimmed.userFullName) return { key: "userFullName", message: "Full name required." };
      if (!trimmed.wardAdminId) return { key: "wardAdminId", message: "Admin ID required." };
      if (!/^(07\d{8}|0\d{9}|\+?\d{10,15})$/.test(trimmed.wardPhone))
        return { key: "wardPhone", message: "Invalid phone." };
      if (!/\S+@\S+\.\S+/.test(trimmed.wardEmail)) return { key: "wardEmail", message: "Invalid email." };
    }

    if (role === "doctor") {
      if (!trimmed.userFullName) return { key: "userFullName", message: "Full name required." };
      if (!trimmed.docAdminId) return { key: "docAdminId", message: "Admin ID required." };
      if (!/^(07\d{8}|0\d{9}|\+?\d{10,15})$/.test(trimmed.docPhone))
        return { key: "docPhone", message: "Invalid phone." };
      if (!/\S+@\S+\.\S+/.test(trimmed.docEmail)) return { key: "docEmail", message: "Invalid email." };
    }

    return null;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const validationError = validateByRole();
    if (validationError) {
      setFieldErrors({ [validationError.key]: validationError.message });
      setFeedback({ type: "error", text: validationError.message });
      return;
    }

    const payload = { ...profileValues, userFullName: trimmedName, profilePhoto };
    try {
      // Save to Firestore
      const userDocRef = doc(db, "userProfiles", userId);
      await setDoc(userDocRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true });

      // Save to localStorage
      Object.entries(payload).forEach(([k, v]) => localStorage.setItem(k, v));

      setFeedback({ type: "success", text: "Profile saved successfully!" });
      onProfileUpdated?.({ profilePhoto, fullName: trimmedName });
    } catch (err) {
      console.error("Firestore save error:", err);
      setFeedback({ type: "error", text: "Failed to save profile." });
    }
  };

  const roleConfig = ROLE_KEYS[role] || ROLE_KEYS.student;

  const renderField = ({ key, label, type, options }) => {
    const value = profileValues[key] || "";
    const error = fieldErrors[key];

    if (type === "select") {
      return (
        <label key={key} className={`profile-form-field ${error ? "error" : ""}`}>
          {label}*
          <select name={key} value={value} onChange={handleInputChange}>
            <option value="" disabled>
              Select {label}
            </option>
            {options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {error && <p className="profile-form-field__error">{error}</p>}
        </label>
      );
    }

    if (type === "textarea") {
      return (
        <label key={key} className={`profile-form-field ${error ? "error" : ""}`}>
          {label}*
          <textarea name={key} value={value} onChange={handleInputChange} rows={3} />
          {error && <p className="profile-form-field__error">{error}</p>}
        </label>
      );
    }

    return (
      <label key={key} className={`profile-form-field ${error ? "error" : ""}`}>
        {label}*
        <input type="text" name={key} value={value} onChange={handleInputChange} />
        {error && <p className="profile-form-field__error">{error}</p>}
      </label>
    );
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="profile-card__close" onClick={onClose}>
          &times;
        </button>

        <div className="tab-bar">
          <button type="button" className={`tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
            Profile
          </button>
          <button type="button" className={`tab ${activeTab === "privacy" ? "active" : ""}`} onClick={() => setActiveTab("privacy")}>
            Privacy
          </button>
        </div>

        <div className="profile-card__content">
          {activeTab === "profile" ? (
            <form onSubmit={handleProfileSave}>
              <div className="profile-photo-picker">
                <label>
                  <img src={profilePhoto || DEFAULT_AVATAR} alt="Profile" className="profile-photo-preview" />
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} />
                </label>
              </div>

              <div className="profile-form-grid">{roleConfig.fields.map(renderField)}</div>

              {feedback.text && <p className={`profile-feedback ${feedback.type}`}>{feedback.text}</p>}

              <button type="submit">Save Changes</button>
            </form>
          ) : (
            <div>
              {/* Privacy / Password form can be added here */}
              <p>Privacy settings placeholder</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileOverlay.propTypes = {
  onClose: PropTypes.func.isRequired,
  onProfileUpdated: PropTypes.func,
};

ProfileOverlay.defaultProps = {
  onProfileUpdated: undefined,
};

export default ProfileOverlay;
