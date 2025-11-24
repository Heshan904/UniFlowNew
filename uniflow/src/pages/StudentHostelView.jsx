import React, { useCallback, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import NaviBar from "../components/NaviBar";
import SideBar from "../components/SideBar";
import "./studentHostelView.css";

const StudentHostelView = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const noticesCollection = collection(db, "hostelNotices");
      const noticesQuery = query(noticesCollection, orderBy("date", "desc"));
      const snapshot = await getDocs(noticesQuery);

      const fetched = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setNotices(fetched);
      setError("");
    } catch (err) {
      console.error("Failed to load notices:", err);
      setError("Could not load notices.");
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  return (
    <>
      <NaviBar />
      <div className="student-hostel">
        <SideBar activePath="/student" />
        <main className="student-hostel__content">
          <h2>Hostel Notices</h2>

          {loading && <p>Loading notices...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && notices.length === 0 && (
            <p>No notices available.</p>
          )}

          <div className="notice-cards-container">
            {!loading &&
              notices.map((notice) => (
                <div key={notice.id} className="notice-card">
                  <div className="notice-card-header">
                    <h3>{notice.title}</h3>
                    <span className="notice-date">{notice.date}</span>
                  </div>
                  <p className="notice-card-description">{notice.description}</p>
                </div>
              ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default StudentHostelView;
