import React, { useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import './canteen.css';

const initialItems = [
  {
    id: 1,
    name: 'Rice & Curry',
    category: 'Main Course',
    desc: 'Traditional Sri Lankan rice and curry',
    price: 150,
    available: true,
    stock: 50,
  },
  {
    id: 2,
    name: 'Kottu Roti',
    category: 'Main Course',
    desc: 'Chopped roti with vegetables',
    price: 200,
    available: true,
    stock: 30,
  },
  {
    id: 3,
    name: 'Fruit Juice',
    category: 'Beverage',
    desc: 'Fresh seasonal fruit juice',
    price: 120,
    available: false,
    stock: 0,
  },
];

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'low-stock', label: 'Low Stock (<20)' },
  { value: 'unavailable', label: 'Unavailable' },
];

function Canteen() {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Main Course',
    price: '',
    stock: '',
    desc: '',
    available: true,
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase());

      const passesFilter =
        filter === 'all' ||
        (filter === 'available' && item.available) ||
        (filter === 'unavailable' && !item.available) ||
        (filter === 'low-stock' && item.stock > 0 && item.stock < 20);

      return matchSearch && passesFilter;
    });
  }, [items, search, filter]);

  const summary = useMemo(() => {
    const totalItems = items.length;
    const available = items.filter((item) => item.available).length;
    const unavailable = totalItems - available;
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    return { totalItems, available, unavailable, totalStock };
  }, [items]);

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleOpenModal = () => {
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

  const handleModalChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleModalSubmit = (event) => {
    event.preventDefault();
    if (!newItem.name.trim() || !newItem.price || !newItem.stock) {
      return;
    }

    setItems((prev) => [
      {
        id: Date.now(),
        name: newItem.name.trim(),
        category: newItem.category.trim(),
        desc: newItem.desc.trim(),
        price: Number(newItem.price),
        available: newItem.available,
        stock: Number(newItem.stock),
      },
      ...prev,
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="canteen-admin">
      <div className="canteen-shell">
        <header className="canteen-hero">
          <h1>Canteen Management System</h1>
          <p>Manage your food menu, prices, and inventory</p>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="canteen-toolbar">
          <div className="canteen-search">
            <input
              type="text"
              placeholder="Search food items..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search canteen items"
            />
          </div>
          <select
            className="canteen-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter canteen items"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="button" className="canteen-add-btn" onClick={handleOpenModal}>
            + Add New Item
          </button>
        </div>

        <section className="canteen-summary">
          <div>
            <span className="summary-value summary-value--blue">
              {summary.totalItems}
            </span>
            <span className="summary-label">Total Items</span>
          </div>
          <div>
            <span className="summary-value summary-value--red">
              {summary.unavailable}
            </span>
            <span className="summary-label">Unavailable</span>
          </div>
          <div>
            <span className="summary-value summary-value--green">
              {summary.available}
            </span>
            <span className="summary-label">Available</span>
          </div>
          <div>
            <span className="summary-value summary-value--purple">
              {summary.totalStock}
            </span>
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
                <button type="button" className="item-btn item-btn--edit">
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
          {!filteredItems.length && (
            <div className="canteen-empty">No items match your search.</div>
          )}
        </section>
      </div>
      {isModalOpen && (
        <div className="canteen-modal" role="dialog" aria-modal="true">
          <div
            className="canteen-modal__backdrop"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="canteen-modal__card">
            <div className="canteen-modal__header">
              <h3>Add New Food Item</h3>
              <button
                type="button"
                className="canteen-modal__close"
                aria-label="Close add item modal"
                onClick={() => setIsModalOpen(false)}
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
                <select
                  name="category"
                  value={newItem.category}
                  onChange={handleModalChange}
                >
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
                  + Add Item
                </button>
                <button
                  type="button"
                  className="canteen-modal__secondary"
                  onClick={() => setIsModalOpen(false)}
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
