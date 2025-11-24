
import React, { useEffect, useState, useCallback } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import './medical.css';

export default function MedicalAdmin() {
  // contacts
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState('');

  // modal / form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ label: 'Emergency', numbers: '' });
  const [submitting, setSubmitting] = useState(false);

  // availability
  const [isAvailable, setIsAvailable] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);

  // references / names
  const contactsCol = collection(db, 'medicalNotice');
  const metaDocRef = doc(db, 'medicalNoticeMeta', 'availability'); // single doc for availability

  // load contacts realtime
  useEffect(() => {
    setLoadingContacts(true);
    const unsub = onSnapshot(
      contactsCol,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Ensure numbers is array
        const normalized = list.map((it) => ({ ...it, numbers: Array.isArray(it.numbers) ? it.numbers : (it.numbers ? [it.numbers] : []) }));
        setContacts(normalized);
        setError('');
        setLoadingContacts(false);
      },
      (err) => {
        console.error('Contacts onSnapshot error', err);
        setError('Failed to load contacts.');
        setLoadingContacts(false);
      }
    );

    return () => unsub();
  }, []);
  const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };

  // load availability (subscribe)
  useEffect(() => {
    setMetaLoading(true);
    const unsub = onSnapshot(
      metaDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsAvailable(Boolean(data.available));
        } else {
          // default false if doc doesn't exist
          setIsAvailable(false);
        }
        setMetaLoading(false);
      },
      (err) => {
        console.error('Meta onSnapshot error', err);
        setMetaLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // open add modal
  const openAdd = () => {
    setEditingId(null);
    setForm({ label: 'Emergency', numbers: '' });
    setIsModalOpen(true);
  };

  // open edit modal
  const openEdit = (contact) => {
    setEditingId(contact.id);
    setForm({
      label: contact.label || 'Emergency',
      numbers: (contact.numbers || []).join(', '),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ label: 'Emergency', numbers: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const label = (form.label || 'Emergency').trim();
    const numberList = (form.numbers || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!label || numberList.length === 0) return;

    setSubmitting(true);
    try {
      if (editingId) {
        // update
        const ref = doc(db, 'medicalNotice', editingId);
        await updateDoc(ref, {
          label,
          numbers: numberList,
          updatedAt: serverTimestamp(),
        });
      } else {
        // add
        await addDoc(contactsCol, {
          label,
          numbers: numberList,
          createdAt: serverTimestamp(),
        });
      }
      closeModal();
    } catch (err) {
      console.error('Save error', err);
      setError('Failed to save contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await deleteDoc(doc(db, 'medicalNotice', id));
    } catch (err) {
      console.error('Delete failed', err);
      setError('Could not delete contact.');
    }
  };

  // toggle availability and persist
  const toggleAvailability = async () => {
    const newVal = !isAvailable;
    setIsAvailable(newVal); // optimistic UI
    try {
      await setDoc(metaDocRef, { available: newVal, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Failed to update availability', err);
      setError('Could not update availability.');
      // revert on failure (optional)
      try {
        const snap = await getDoc(metaDocRef);
        if (snap.exists()) setIsAvailable(Boolean(snap.data().available));
      } catch {}
    }
  };

  return (
    <>
      <div className="medicalmain">
        <div className="medicalcontent">
          <div className="medical-admin">
            <section className="medical-banner">
              <h1>Medical Center Admin</h1>
              <p>Control availability & emergency contacts</p>
              <button type="button" className="admin-logout" onClick={handleLogout}> Logout </button>
            </section>

            <section className="medical-availability">
              <span>Medical Availability</span>
              <button
                type="button"
                className={`availability-toggle${isAvailable ? ' is-on' : ''}`}
                onClick={toggleAvailability}
                aria-pressed={isAvailable}
                aria-label="Toggle medical availability"
                disabled={metaLoading}
              >
                <span />
              </button>
            </section>

            <div className="medical-toolbar">
              <button type="button" className="medical-add-btn" onClick={openAdd}>
                + Add Emergency Number
              </button>
            </div>

            {error && <div className="hostal-error">{error}</div>}

            <section className="medical-services">
              <h2>Emergency & Services</h2>
              <div className="medical-card-list">
                {loadingContacts ? (
                  <div>Loading contacts...</div>
                ) : contacts.length ? (
                  contacts.map((c) => (
                    <article key={c.id} className="medical-card">
                      <div className="medical-card__label">
                        {c.label}:
                      </div>
                      <div className="medical-card__numbers">
                        {(c.numbers || []).map((n) => <span key={n}>{n}</span>)}
                      </div>
                      <div className="medical-card__actions">
                        <button type="button" onClick={() => openEdit(c)} aria-label="Edit">
                          <FiEdit2 />
                        </button>
                        <button type="button" onClick={() => handleDelete(c.id)} aria-label="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div>No emergency contacts yet.</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="medical-modal" role="dialog" aria-modal="true">
          <div className="medical-modal__backdrop" onClick={closeModal} />
          <div className="medical-modal__card">
            <div className="medical-modal__header">
              <h3>{editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</h3>
              <button type="button" aria-label="Close" onClick={closeModal}>×</button>
            </div>

            <form className="medical-modal__form" onSubmit={handleSave}>
              <label className="medical-modal__field">
                <span>Label</span>
                <input name="label" value={form.label} onChange={handleFormChange} />
              </label>

              <label className="medical-modal__field">
                <span>Numbers</span>
                <textarea
                  name="numbers"
                  value={form.numbers}
                  onChange={handleFormChange}
                  placeholder="077 586 9645, 1990"
                  rows={3}
                  required
                />
                <small>Separate multiple numbers with commas.</small>
              </label>

              <div className="medical-modal__actions">
                <button type="button" className="medical-modal__secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="medical-modal__primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
