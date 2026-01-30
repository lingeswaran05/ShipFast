import React, { useState } from 'react';
import './Payment.css';

const PaymentHistory = () => {
  const [filter, setFilter] = useState('All Status');

  const transactions = [
    { id: 'INV-2025-001234', status: 'Paid', type: 'Express Delivery', route: 'Bangalore to Mumbai', amount: 250, date: '2025-01-05 10:30 AM', method: 'UPI' },
    { id: 'INV-2025-001233', status: 'Paid', type: 'Standard Delivery', route: 'Delhi to Chennai', amount: 180, date: '2025-01-03 02:15 PM', method: 'Credit Card' },
    { id: 'INV-2025-001232', status: 'Paid', type: 'Express Delivery', route: 'Mumbai to Kolkata', amount: 320, date: '2025-01-02 09:45 AM', method: 'Debit Card' },
    { id: 'INV-2025-001231', status: 'Refunded', type: 'Standard Delivery', route: 'Cancelled', amount: 150, date: '2024-12-28 04:20 PM', method: 'UPI' },
    { id: 'INV-2025-001230', status: 'Pending', type: 'Express Delivery', route: 'Processing', amount: 280, date: '2024-12-25 11:10 AM', method: 'Wallet' }
  ];

  const filteredData =
    filter === 'All Status'
      ? transactions
      : transactions.filter(t => t.status === filter);

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h2>Payment History</h2>
        <p>View all your transactions and invoices</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <div className="icon-box green"><i className="bi bi-check-circle"></i></div>
          <div className="stat-val">₹750</div>
          <div className="stat-label">Total Paid</div>
        </div>

        <div className="stat-card blue">
          <div className="icon-box blue"><i className="bi bi-arrow-counterclockwise"></i></div>
          <div className="stat-val">₹150</div>
          <div className="stat-label">Total Refunded</div>
        </div>

        <div className="stat-card purple">
          <div className="icon-box purple"><i className="bi bi-receipt"></i></div>
          <div className="stat-val">5</div>
          <div className="stat-label">Total Transactions</div>
        </div>

        <div className="stat-card orange">
          <div className="icon-box orange"><i className="bi bi-calendar3"></i></div>
          <div className="stat-val">Jan 2025</div>
          <div className="stat-label">Current Period</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrapper">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search by invoice or tracking number..." />
        </div>

        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All Status</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Refunded</option>
        </select>
      </div>

      <div className="transaction-list">
        {filteredData.map(item => (
          <div key={item.id} className="transaction-item">
            <div className="item-info">
              <div className={`status-icon ${item.status.toLowerCase()}`}>
                <i className="bi bi-receipt"></i>
              </div>

              <div>
                <div className="invoice-id">
                  {item.id}
                  <span className={`status-badge ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>

                <div className="route-detail">
                  {item.type} – {item.route}
                </div>

                <div className="meta-data">
                  Tracking: <span className="link">SF{item.id.slice(-6)}</span> • Method: {item.method} • {item.date}
                </div>
              </div>
            </div>

            <div className="item-action">
              <span className="amount">₹{item.amount}</span>
              <i className="bi bi-eye action-icon"></i>
              <i className="bi bi-download action-icon"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
