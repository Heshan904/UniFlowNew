// src/pages/MedicalStudent.jsx
import React, { useEffect, useState } from 'react';
import NaviBar from '../components/NaviBar';
import SideBar from '../components/SideBar';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { db } from '../firebase';
import './medical.css';

export default function MedicalStudent() {
  const [contacts, setContacts] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const contactsUnsub = onSnapshot(collection(db, 'medicalNotice'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setContacts(list.map((it) => ({ ...it, numbers: Array.isArray(it.numbers) ? it.numbers : (it.numbers ? [it.numbers] : []) })));
    });

    const metaUnsub = onSnapshot(doc(db, 'medicalNoticeMeta', 'availability'), (docSnap) => {
      if (docSnap.exists()) {
        setIsAvailable(Boolean(docSnap.data().available));
      } else {
        setIsAvailable(false);
      }
      setLoading(false);
    });

    return () => {
      contactsUnsub();
      metaUnsub();
    };
  }, []);

  return (
    <>
      <NaviBar />
      <div className="medicalmain">
        <SideBar />
        <div className="medicalcontent">

          <section className="medical-availability">
            <span>Medical Availability</span>
            <div className={`availability-display ${isAvailable ? 'is-on' : 'is-off'}`}>
              {loading ? 'Loading...' : (isAvailable ? 'Available' : 'Not Available')}
            </div>
          </section>
          

          <section className="medical-services">
            <h2>Emergency & Services</h2>
            <div className="medical-card-list">
              {contacts.length ? contacts.map((c) => (
                <article key={c.id} className="medical-card">
                  <div className="medical-card__label">{c.label}:</div>
                  <div className="medical-card__numbers">
                    {(c.numbers || []).map((n) => <span key={n}>{n}</span>)}
                  </div>
                </article>
              )) : <div>No emergency contacts available.</div>}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
