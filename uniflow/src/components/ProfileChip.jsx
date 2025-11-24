import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./profileChip.css";
import unknownAvatar from "../assets/unknown-avatar.svg";

const ProfileChip = ({ userId, onClick }) => {
  const [displayName, setDisplayName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
    if (!userId) return;

    const docRef = doc(db, "userProfiles", userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDisplayName(data.fullName || "");
        setProfilePhoto(data.profilePhoto || "");
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const effectivePhoto =
    typeof profilePhoto === "string" && profilePhoto.trim().length > 0
      ? profilePhoto
      : unknownAvatar;

  const effectiveName = displayName || "Unknown User";

  return (
    <button
      type="button"
      className="profile-chip"
      onClick={onClick}
      aria-label="Open profile settings"
    >
      <img src={effectivePhoto} alt="Profile" />
      <span>{effectiveName}</span>
    </button>
  );
};

ProfileChip.propTypes = {
  userId: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

ProfileChip.defaultProps = {
  onClick: undefined,
};

export default ProfileChip;
