"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/config";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  createdAt?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // New Customer Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<'directory' | 'register'>('directory');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch all customers on mount
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/customers`);
      if (!response.ok) {
        throw new Error("Failed to load customers catalog");
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching customers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle Add Customer Form Submit
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!name || !phone || !address) {
      setFormError("Name, phone, and address are required!");
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save customer");
      }

      // Reset form fields
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setSuccessMsg("Customer registered successfully!");
      setActiveTab("directory");
      
      // Refresh the customer ledger
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Delete Customer
  const executeDeleteCustomer = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }
      setCustomers(customers.filter((c) => c._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to remove customer profile.");
      setTimeout(() => setError(""), 5000);
    }
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.address.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  return (
    <main className="dashboard-container" style={{ paddingBottom: "80px" }}>
      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Customer Directory</h1>
          <p className="dashboard-subtitle">Manage, view, and search your invoice billing clients.</p>
        </div>
        <Link href="/create" className="btn-accent">
          + Create Invoice
        </Link>
      </div>

      {/* Tab Navigation Controls */}
      <div className="tabs-navigation" style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-card)', paddingBottom: '15px', marginBottom: '25px', marginTop: '20px' }}>
        <button 
          onClick={() => setActiveTab('directory')}
          style={{
            background: activeTab === 'directory' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'directory' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'directory' ? 'none' : '1px solid var(--border-card)',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'directory' ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
          }}
        >
          📂 Client Ledger Table
        </button>
        <button 
          onClick={() => setActiveTab('register')}
          style={{
            background: activeTab === 'register' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'register' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'register' ? 'none' : '1px solid var(--border-card)',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'register' ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
          }}
        >
          ➕ Register New Client
        </button>
      </div>

      {/* Main Workspace Content based on Selected Tab */}
      {activeTab === 'directory' ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Search bar */}
          <div className="search-container" style={{ width: "100%", maxWidth: "none", margin: 0 }}>
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search clients by name, phone, or address..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Loader */}
          {isLoading && (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
              <div className="loading-spinner" style={{ margin: "0 auto 15px auto" }}></div>
              <p style={{ color: "var(--text-secondary)" }}>Loading billing clients...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="glass-card" style={{ padding: "30px", borderLeft: "4px solid #ef4444" }}>
              <p style={{ color: "#f87171", fontWeight: 500 }}>⚠️ Error loading ledger</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "5px" }}>{error}</p>
            </div>
          )}

          {/* Customer Ledger Table */}
          {!isLoading && !error && (
            <>
              {filteredCustomers.length === 0 ? (
                <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center" }}>
                  <p style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)" }}>No Customers Found</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "5px" }}>
                    {searchTerm ? "No results match your search term." : "Start by registering a client in the Register tab!"}
                  </p>
                </div>
              ) : (
                <div className="table-card">
                  <table className="invoice-list-table">
                    <thead>
                      <tr>
                        <th>Client Name</th>
                        <th>Phone Number</th>
                        <th>Email Address</th>
                        <th>Billing Address</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((cust) => (
                        <tr key={cust._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: 700, fontSize: "0.95rem" }}>
                                {cust.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cust.name}</span>
                            </div>
                          </td>
                          <td className="font-medium" style={{ color: 'var(--text-secondary)' }}>{cust.phone}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{cust.email || '-'}</td>
                          <td style={{ color: 'var(--text-secondary)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cust.address}>
                            {cust.address}
                          </td>
                          <td className="text-right">
                            <button 
                              onClick={() => setDeleteConfirmId(cust._id)}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "6px 12px", transition: "transform 0.15s ease" }}
                              title="Delete Customer"
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Register Drawer Tab Form */
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: "30px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "5px" }}>Register New Client</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "25px" }}>
              Add a customer to pre-save their details in the billing system.
            </p>

            <form onSubmit={handleAddCustomer} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              
              {/* Form Alerts */}
              {formError && (
                <div style={{ padding: "10px 15px", background: "rgba(239, 68, 68, 0.1)", borderLeft: "3px solid #ef4444", borderRadius: "4px", fontSize: "0.8rem", color: "#f87171" }}>
                  {formError}
                </div>
              )}
              {successMsg && (
                <div style={{ padding: "10px 15px", background: "rgba(34, 197, 94, 0.1)", borderLeft: "3px solid #22c55e", borderRadius: "4px", fontSize: "0.8rem", color: "#4ade80" }}>
                  {successMsg}
                </div>
              )}

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.85rem" }}>Customer Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. RDS Furniture Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.85rem" }}>Phone Number *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.85rem" }}>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. client@website.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.85rem" }}>Billing Address *</label>
                <textarea 
                  className="form-input" 
                  placeholder="e.g. House 45, Road 2, Banani, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ minHeight: "100px", resize: "vertical" }}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: "100%", padding: "12px", marginTop: "10px", fontWeight: 700 }}
                disabled={isAdding}
              >
                {isAdding ? "Saving..." : "Save Customer"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-card" style={{
            maxWidth: '400px', width: '90%', padding: '30px',
            textAlign: 'center', background: '#ffffff',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            border: '1px solid var(--border-card)', borderRadius: '16px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Confirm Delete</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.5' }}>
              Are you sure you want to permanently remove this customer? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary"
                style={{ padding: '10px 20px', minWidth: '100px', justifyContent: 'center', margin: 0 }}>
                Cancel
              </button>
              <button
                onClick={() => { executeDeleteCustomer(deleteConfirmId); setDeleteConfirmId(null); }}
                className="btn-primary"
                style={{ padding: '10px 20px', minWidth: '100px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.2)', border: 'none',
                  justifyContent: 'center', color: '#fff', margin: 0 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
