import React, { useCallback, useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import './hostal.css';

function Hostal() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [submitting, setSubmitting] = useState(false);

  const noticesCollection = collection(db, 'hostelNotices');

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const noticesQuery = query(noticesCollection, orderBy('date', 'desc'));
      const snapshot = await getDocs(noticesQuery);
      const fetched = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          title: data.title,
          description: data.description ?? data.desc ?? '',
          date: data.date,
        };
      });
      setNotices(fetched);
      setError('');
    } catch (err) {
      setError('Unable to load notices. Please try again later.');
      console.error('Error loading notices', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const resetModal = () => {
    setNewNotice({
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const handleAddNotice = () => {
    resetModal();
    setIsModalOpen(true);
  };

  const handleModalChange = (event) => {
    const { name, value } = event.target;
    setNewNotice((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = async (event) => {
    event.preventDefault();
    const title = newNotice.title.trim();
    const description = newNotice.description.trim();

    if (!title) {
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(noticesCollection, {
        title,
        description: description || 'No additional details provided.',
        date: newNotice.date || new Date().toISOString().slice(0, 10),
        createdAt: serverTimestamp(),
      });
      resetModal();
      setIsModalOpen(false);
      loadNotices();
    } catch (err) {
      console.error('Failed to add notice', err);
      setError('Could not save notice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(noticesCollection, id));
      loadNotices();
    } catch (err) {
      console.error('Failed to delete notice', err);
      setError('Could not delete the notice. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="hostal-page">
      <div className="hostal-shell">
        <section className="hostal-banner">
          <h1>Hostel Management System</h1>
          <button type="button" className="hostal-logout" onClick={handleLogout}>
            Logout
          </button>
        </section>

        <section className="hostal-notice-section">
          <div className="hostal-notice-header">
            <h2>Manage Notices</h2>
            <button type="button" className="hostal-add-btn" onClick={handleAddNotice}>
              + Add Notice
            </button>
          </div>

          {error && <div className="hostal-error">{error}</div>}
          {loading ? (
            <div className="hostal-empty-state">Loading notices...</div>
          ) : (
            <ul className="hostal-notice-list">
              {notices.map((notice) => (
                <li key={notice.id} className="hostal-notice-card">
                  <div className="hostal-notice-body">
                    <h3>{notice.title}</h3>
                    <p>{notice.description}</p>
                    <span className="hostal-notice-date">{notice.date}</span>
                  </div>
                  <button
                    type="button"
                    className="hostal-delete-btn"
                    aria-label={`Delete notice ${notice.title}`}
                    onClick={() => handleDelete(notice.id)}
                  >
                    <FiTrash2 />
                  </button>
                </li>
              ))}
              {!notices.length && (
                <li className="hostal-empty-state">No notices yet. Add your first notice.</li>
              )}
            </ul>
          )}
        </section>
      </div>
      {isModalOpen && (
        <div className="hostal-modal" role="dialog" aria-modal="true">
          <div className="hostal-modal__backdrop" onClick={handleModalClose} />
          <div className="hostal-modal__card">
            <div className="hostal-modal__header">
              <h3>Add Notice</h3>
              <button
                type="button"
                className="hostal-modal__close"
                aria-label="Close add notice modal"
                onClick={handleModalClose}
              >
                ×
              </button>
            </div>
            <form className="hostal-modal__form" onSubmit={handleModalSubmit}>
              <label className="hostal-modal__field">
                <span>Title</span>
                <input
                  type="text"
                  name="title"
                  value={newNotice.title}
                  onChange={handleModalChange}
                  placeholder="Notice title"
                  required
                />
              </label>
              <label className="hostal-modal__field">
                <span>Description</span>
                <textarea
                  name="description"
                  value={newNotice.description}
                  onChange={handleModalChange}
                  placeholder="Provide the notice details..."
                  rows={4}
                />
              </label>
              <label className="hostal-modal__field">
                <span>Date</span>
                <input
                  type="date"
                  name="date"
                  value={newNotice.date}
                  onChange={handleModalChange}
                  required
                />
              </label>
              <div className="hostal-modal__actions">
                <button type="button" className="hostal-modal__secondary" onClick={handleModalClose}>
                  Cancel
                </button>
                <button type="submit" className="hostal-modal__primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hostal;
