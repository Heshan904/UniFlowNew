import React, { useMemo, useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import './canteen.css';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'low-stock', label: 'Low Stock (<20)' },
  { value: 'unavailable', label: 'Unavailable' },
];

function Canteen() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // editingId is null when adding, set to doc.id when editing
  const [editingId, setEditingId] = useState(null);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Main Course',
    price: '',
    stock: '',
    desc: '',
    available: true,
  });

  // Load items with realtime listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'canteenItems'), (snapshot) => {
      const itemList = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setItems(itemList);
    }, (err) => {
      console.error('onSnapshot error:', err);
    });

    return () => unsubscribe();
  }, []);

  // Filter & search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.desc && item.desc.toLowerCase().includes(q));

      const passesFilter =
        filter === 'all' ||
        (filter === 'available' && item.available) ||
        (filter === 'unavailable' && !item.available) ||
        (filter === 'low-stock' && item.stock > 0 && item.stock < 20);

      return matchSearch && passesFilter;
    });
  }, [items, search, filter]);

  // Summary
  const summary = useMemo(() => {
    const totalItems = items.length;
    const available = items.filter((item) => item.available).length;
    const unavailable = totalItems - available;
    const totalStock = items.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
    return { totalItems, available, unavailable, totalStock };
  }, [items]);

  // Delete
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'canteenItems', id));
    } catch (e) {
      console.error('Delete Error:', e);
    }
  };

  // Open modal for adding
  const handleOpenModalForAdd = () => {
    setEditingId(null);
    setNewItem({
      name: '',
      category: 'Main Course',
      price: '',
      stock: '',
      desc: '',
      available: true,
    });
    setIsModalOpen(true);
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  // Open modal for editing
  const handleEdit = (item) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name ?? '',
      category: item.category ?? 'Main Course',
      price: item.price ?? '',
      stock: item.stock ?? '',
      desc: item.desc ?? '',
      available: !!item.available,
    });
    setIsModalOpen(true);
  };

  // Modal input change (generic)
  const handleModalChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit (add or update)
  const handleModalSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!newItem.name.trim()) return;
    if (newItem.price === '' || newItem.stock === '') return;

    const itemData = {
      name: newItem.name.trim(),
      category: (newItem.category || '').trim(),
      desc: (newItem.desc || '').trim(),
      price: Number(newItem.price),
      stock: Number(newItem.stock),
      available: !!newItem.available,
    };

    try {
      if (editingId) {
        // update existing
        const itemRef = doc(db, 'canteenItems', editingId);
        await updateDoc(itemRef, itemData);
      } else {
        // add new
        await addDoc(collection(db, 'canteenItems'), itemData);
      }

      // close modal; onSnapshot will refresh the list automatically
      setIsModalOpen(false);
      setEditingId(null);
    } catch (e) {
      console.error('Save Error:', e);
    }
  };

  return (
    <div className="canteen-admin">
      <div className="canteen-shell">
        <header className="canteen-hero">
          <h1>Canteen Management System</h1>
          <p>Manage your food menu, prices, and inventory</p>
          <button type="button" className="admin-logout" onClick={handleLogout}> Logout </button>
        </header>

        <div className="canteen-toolbar">
          <div className="canteen-search">
            <input
              type="text"
              placeholder="Search food items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search canteen items"
            />
          </div>

          <select
            className="canteen-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter canteen items"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button type="button" className="canteen-add-btn" onClick={handleOpenModalForAdd}>
            + Add New Item
          </button>
        </div>

        <section className="canteen-summary">
          <div>
            <span className="summary-value summary-value--blue">{summary.totalItems}</span>
            <span className="summary-label">Total Items</span>
          </div>
          <div>
            <span className="summary-value summary-value--red">{summary.unavailable}</span>
            <span className="summary-label">Unavailable</span>
          </div>
          <div>
            <span className="summary-value summary-value--green">{summary.available}</span>
            <span className="summary-label">Available</span>
          </div>
          <div>
            <span className="summary-value summary-value--purple">{summary.totalStock}</span>
            <span className="summary-label">Total Stock</span>
          </div>
        </section>

        <section className="canteen-item-list">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className={`canteen-item ${item.available ? 'is-available' : 'is-unavailable'}`}
            >
              <div className="canteen-item__body">
                <div>
                  <h3>{item.name}</h3>
                  <span className="item-chip">{item.category}</span>
                  <p>{item.desc}</p>
                  <strong className="item-price">LKR {item.price}</strong>
                </div>
                <div className="item-meta">
                  <button type="button" className="item-meta__icon" aria-label="View item">
                    <FiEye />
                  </button>
                  <span className="item-stock">
                    {item.available ? `${item.stock} available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              <div className="canteen-item__actions">
                <button
                  type="button"
                  className="item-btn item-btn--edit"
                  onClick={() => handleEdit(item)}
                >
                  <FiEdit2 />
                  Edit
                </button>
                <button
                  type="button"
                  className="item-btn item-btn--delete"
                  onClick={() => handleDelete(item.id)}
                >
                  <FiTrash2 />
                  Delete
                </button>
              </div>
            </article>
          ))}

          {!filteredItems.length && <div className="canteen-empty">No items match your search.</div>}
        </section>
      </div>

      {isModalOpen && (
        <div className="canteen-modal" role="dialog" aria-modal="true">
          <div className="canteen-modal__backdrop" onClick={() => { setIsModalOpen(false); setEditingId(null); }} />
          <div className="canteen-modal__card">
            <div className="canteen-modal__header">
              <h3>{editingId ? 'Edit Food Item' : 'Add New Food Item'}</h3>
              <button
                type="button"
                className="canteen-modal__close"
                aria-label="Close add item modal"
                onClick={() => { setIsModalOpen(false); setEditingId(null); }}
              >
                ×
              </button>
            </div>

            <form className="canteen-modal__form" onSubmit={handleModalSubmit}>
              <label className="canteen-modal__field">
                <span>Food Name</span>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleModalChange}
                  placeholder="Enter food name"
                  required
                />
              </label>

              <label className="canteen-modal__field">
                <span>Category</span>
                <select name="category" value={newItem.category} onChange={handleModalChange}>
                  <option>Main Course</option>
                  <option>Side Dish</option>
                  <option>Beverage</option>
                  <option>Dessert</option>
                </select>
              </label>

              <label className="canteen-modal__field">
                <span>Price (LKR)</span>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={newItem.price}
                  onChange={handleModalChange}
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="canteen-modal__field">
                <span>Quantity Available</span>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  value={newItem.stock}
                  onChange={handleModalChange}
                  placeholder="0"
                  required
                />
              </label>

              <label className="canteen-modal__field">
                <span>Description</span>
                <textarea
                  name="desc"
                  rows={3}
                  value={newItem.desc}
                  onChange={handleModalChange}
                  placeholder="Brief description of the food item"
                />
              </label>

              <label className="canteen-modal__checkbox">
                <input
                  type="checkbox"
                  name="available"
                  checked={newItem.available}
                  onChange={handleModalChange}
                />
                Available for sale
              </label>

              <div className="canteen-modal__actions">
                <button type="submit" className="canteen-modal__primary">
                  {editingId ? 'Save Changes' : '+ Add Item'}
                </button>
                <button
                  type="button"
                  className="canteen-modal__secondary"
                  onClick={() => { setIsModalOpen(false); setEditingId(null); }}
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

export default Canteen;
