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
  deletedAt?: string;
}

export default function TrashPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{ id: string, type: 'restore' | 'force' } | null>(null);

  useEffect(() => {
    fetchTrashedInvoices();
  }, []);

  const fetchTrashedInvoices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/trash`);
      if (!response.ok) {
        throw new Error('Failed to fetch trashed invoices');
      }
      const data = await response.json();
      setInvoices(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const executeRestore = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/restore`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to restore invoice');
      setInvoices(invoices.filter(inv => inv._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to restore invoice.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const executeForceDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/force`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to permanently delete invoice');
      setInvoices(invoices.filter(inv => inv._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete invoice.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer.phone.includes(searchTerm)
  );

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const calculateDaysRemaining = (deletedAt?: string) => {
    if (!deletedAt) return 'Unknown';
    const deletedDate = new Date(deletedAt);
    const expireDate = new Date(deletedDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = expireDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Expiring soon';
  };

  return (
    <main className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Trash Bin</h1>
          <p>Items here will be automatically deleted after 14 days.</p>
        </div>
      </div>

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
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="search-container">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" style={{ alignSelf: 'center' }}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search trashed invoices..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading trashed invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: '15px' }}>
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>Trash is empty</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>No deleted invoices found.</p>
          </div>
        ) : (
          <table className="invoice-list-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Deleted On</th>
                <th>Time Remaining</th>
                <th className="text-right">Total Amount</th>
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
                  <td>{inv.deletedAt ? formatDate(inv.deletedAt) : 'Unknown'}</td>
                  <td>
                    <span style={{ color: '#fb923c', fontWeight: 600, fontSize: '0.85rem' }}>
                      {calculateDaysRemaining(inv.deletedAt)}
                    </span>
                  </td>
                  <td className="text-right font-medium" style={{ color: '#60a5fa' }}>
                    {inv.totalPayableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        onClick={() => setActionConfirm({ id: inv._id, type: 'restore' })}
                        className="btn-secondary"
                        style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.85rem', margin: 0, color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}
                      >
                        Restore
                      </button>
                      <button 
                        onClick={() => setActionConfirm({ id: inv._id, type: 'force' })}
                        className="btn-secondary"
                        style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.85rem', margin: 0, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {actionConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '30px', textAlign: 'center', background: '#ffffff', borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{actionConfirm.type === 'restore' ? '♻️' : '⚠️'}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              {actionConfirm.type === 'restore' ? 'Restore Invoice?' : 'Permanently Delete?'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '25px' }}>
              {actionConfirm.type === 'restore' 
                ? 'This invoice will be moved back to the main dashboard and included in the total.'
                : 'This action cannot be undone. The invoice will be permanently removed from the system.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setActionConfirm(null)} className="btn-secondary" style={{ padding: '10px 20px', minWidth: '100px' }}>Cancel</button>
              <button 
                onClick={() => {
                  if (actionConfirm.type === 'restore') executeRestore(actionConfirm.id);
                  else executeForceDelete(actionConfirm.id);
                  setActionConfirm(null);
                }}
                className="btn-primary"
                style={{ 
                  padding: '10px 20px', minWidth: '100px',
                  background: actionConfirm.type === 'restore' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none', color: '#fff'
                }}
              >
                {actionConfirm.type === 'restore' ? 'Restore' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
