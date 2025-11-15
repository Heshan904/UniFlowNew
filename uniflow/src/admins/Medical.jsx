

import React, { useState } from 'react';
import './medical.css';
const defaultNumbers = [
  {
    id: 1,
    label: 'Title',
    numbers: ['077 586 9645'],
  },
];
function Medical() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [contacts, setContacts] = useState(defaultNumbers);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({
    label: 'Emergency',
    numbers: '',
  });
  const toggleAvailability = () => {
    setIsAvailable((prev) => !prev);
  };
  const handleAddClick = () => {
    setFormValues({ label: 'Emergency', numbers: '' });
    setShowForm(true);
  };
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!formValues.numbers.trim()) {
      return;
    }
    const numberList = formValues.numbers
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    setContacts((prev) => [
      {
        id: Date.now(),
        label: formValues.label.trim() || 'Emergency',
        numbers: numberList,
      },
      ...prev,
    ]);
    setShowForm(false);
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="medical-admin">
      <div className="medical-shell">
        <section className="medical-banner">
          <h1>Medical Center Management System</h1>
          <p>Doctor Availability Management</p>
          <button type="button" className="medical-logout" onClick={handleLogout}>
            Logout
          </button>
        </section>
        <section className="medical-availability">
          <span>Medical Availability</span>
          <button
            type="button"
            className={`availability-toggle${isAvailable ? ' is-on' : ''}`}
            onClick={toggleAvailability}
            aria-pressed={isAvailable}
            aria-label="Toggle medical availability"
          >
            <span />
          </button>
        </section>
        <div className="medical-toolbar">
          <button type="button" className="medical-add-btn" onClick={handleAddClick}>
            + Add Emergency Number
          </button>
        </div>
        <section className="medical-services">
          <h2>Emergency &amp; Services</h2>
          <div className="medical-card-list">
            {contacts.map((contact) => (
              <article key={contact.id} className="medical-card">
                <div className="medical-card__label">{contact.label}:</div>
                <div className="medical-card__numbers">
                  {contact.numbers.map((num) => (
                    <span key={num}>{num}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      {showForm && (
        <div className="medical-modal" role="dialog" aria-modal="true">
          <div className="medical-modal__backdrop" onClick={() => setShowForm(false)} />
          <div className="medical-modal__card">
            <div className="medical-modal__header">
              <h3>Add Emergency Contact</h3>
              <button
                type="button"
                aria-label="Close add emergency contact"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <form className="medical-modal__form" onSubmit={handleFormSubmit}>
              <label className="medical-modal__field">
                <span>Label</span>
                <input
                  type="text"
                  name="label"
                  value={formValues.label}
                  onChange={handleFormChange}
                  placeholder="Emergency"
                />
              </label>
              <label className="medical-modal__field">
                <span>Numbers</span>
                <textarea
                  name="numbers"
                  value={formValues.numbers}
                  onChange={handleFormChange}
                  placeholder="077 586 9645, 1990"
                  rows={3}
                  required
                />
                <small>Separate multiple numbers with commas.</small>
              </label>
              <div className="medical-modal__actions">
                <button type="submit" className="medical-modal__primary">
                  Save
                </button>
                <button
                  type="button"
                  className="medical-modal__secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Medical;
