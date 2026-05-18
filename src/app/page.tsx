"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  totalPayableAmount: number;
  templateName: 'template1' | 'template2';
  paymentStatus?: 'Paid' | 'Due';
  paidAmount?: number;
  dueAmount?: number;
}

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const executeDeleteInvoice = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      setInvoices(invoices.filter(inv => inv._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete invoice.');
      setTimeout(() => setError(null), 5000);
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/invoices`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        const data = await response.json();
        setInvoices(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unable to connect to the backend server. Make sure it is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Filter invoices based on search term (Invoice # or Customer name)
  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer.phone.includes(searchTerm)
  );

  // Compute metrics
  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.totalPayableAmount, 0);
  const totalInvoicesCount = invoices.length;
  const uniqueCustomers = new Set(invoices.map(inv => inv.customer.phone)).size;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header" style={{ justifyContent: 'flex-end', marginBottom: '24px' }}>
        <Link href="/create" className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Invoice
        </Link>
      </div>

      {/* Backend Connection Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '15px 20px',
          marginBottom: '30px',
          color: '#fca5a5',
          fontSize: '0.95rem'
        }}>
          <strong>Connection Warning:</strong> {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-title">Total Invoiced</p>
          <p className="stat-val" style={{ color: '#60a5fa' }}>
            {totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>BDT</span>
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-title">Invoices Generated</p>
          <p className="stat-val" style={{ color: '#34d399' }}>{totalInvoicesCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-title">Unique Customers</p>
          <p className="stat-val" style={{ color: '#fb923c' }}>{uniqueCustomers}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" style={{ alignSelf: 'center' }}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search by invoice number, customer name, or phone..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Invoices List Card */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255,255,255,0.1)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 15px auto',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
            Loading past invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: '15px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>No invoices found</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your very first invoice.'}
            </p>
            {!searchTerm && (
              <Link href="/create" className="btn-primary" style={{ display: 'inline-flex' }}>
                Create Invoice
              </Link>
            )}
          </div>
        ) : (
          <table className="invoice-list-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th className="text-right">Total Amount</th>
                <th>Status</th>
                <th>Template</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv._id}>
                  <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{inv.invoiceNumber}</td>
                  <td>
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{inv.customer.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.customer.phone}</div>
                    </div>
                  </td>
                  <td>{formatDate(inv.date)}</td>
                  <td className="text-right font-medium" style={{ color: '#60a5fa' }}>
                    {inv.totalPayableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT
                  </td>
                  <td>
                    <span className={`badge badge-${inv.paymentStatus === 'Paid' ? 'paid' : 'due'}`}>
                      {inv.paymentStatus === 'Paid' ? 'PAID' : 'DUE'}
                    </span>
                    {inv.paymentStatus === 'Due' && inv.dueAmount !== undefined && (
                      <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', fontWeight: 600 }}>
                        Due: {inv.dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT
                      </div>
                    )}
                    {inv.paymentStatus === 'Paid' && (
                      <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>
                        Fully Cleared
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${inv.templateName}`}>
                      {inv.templateName === 'template1' ? 'RDS Studio' : 'Partner Style'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link 
                        href={`/invoice/${inv._id}`} 
                        className="btn-secondary"
                        style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.85rem', margin: 0 }}
                      >
                        View & Print
                      </Link>
                      <button 
                        onClick={() => setDeleteConfirmId(inv._id)}
                        className="btn-secondary"
                        style={{ 
                          display: 'inline-flex', 
                          padding: '6px 10px', 
                          fontSize: '0.9rem', 
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          background: 'rgba(239, 68, 68, 0.05)',
                          margin: 0,
                          transition: 'all 0.2s ease'
                        }}
                        title="Delete Invoice"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ef4444';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                          e.currentTarget.style.color = '#f87171';
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-card" style={{
            maxWidth: '400px',
            width: '90%',
            padding: '30px',
            textAlign: 'center',
            background: '#ffffff',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Confirm Delete</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete this invoice? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary"
                style={{ padding: '10px 20px', minWidth: '100px', justifyContent: 'center', margin: 0 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  executeDeleteInvoice(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="btn-primary"
                style={{ 
                  padding: '10px 20px', 
                  minWidth: '100px', 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)', 
                  border: 'none', 
                  justifyContent: 'center',
                  color: '#fff',
                  margin: 0
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
