"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/config";

interface Service {
  _id: string;
  name: string;
  rate: number;
  createdAt?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // New Service Form State
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<'directory' | 'register'>('directory');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch all services on mount
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/services`);
      if (!response.ok) {
        throw new Error("Failed to load services catalog");
      }
      const data = await response.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching services.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle Add/Update Service Submit
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!name || rate === "") {
      setFormError("Service name and base rate are required!");
      return;
    }

    if (Number(rate) < 0) {
      setFormError("Rate cannot be negative!");
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch(`${API_BASE_URL}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rate: Number(rate) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save service");
      }

      // Reset form fields
      setName("");
      setRate("");
      setSuccessMsg("Service catalog updated successfully!");
      setActiveTab("directory");
      
      // Refresh the services catalog
      fetchServices();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Delete Service
  const executeDeleteService = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete service");
      }
      setServices(services.filter((s) => s._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to remove service from catalog.");
      setTimeout(() => setError(""), 5000);
    }
  };

  // Filter services by search term
  const filteredServices = services.filter((s) => {
    return s.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <main className="dashboard-container" style={{ paddingBottom: "80px" }}>
      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Services & Rates Catalog</h1>
          <p className="dashboard-subtitle">Manage, search, and pre-configure default rates for your catalog services.</p>
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
          📂 Catalog Services Ledger
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
          ➕ Register Catalog Item
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
              placeholder="Search services by description..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Loader */}
          {isLoading && (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
              <div className="loading-spinner" style={{ margin: "0 auto 15px auto" }}></div>
              <p style={{ color: "var(--text-secondary)" }}>Loading service catalog...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="glass-card" style={{ padding: "30px", borderLeft: "4px solid #ef4444" }}>
              <p style={{ color: "#f87171", fontWeight: 500 }}>⚠️ Error loading services</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "5px" }}>{error}</p>
            </div>
          )}

          {/* Services Ledger Table */}
          {!isLoading && !error && (
            <>
              {filteredServices.length === 0 ? (
                <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center" }}>
                  <p style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)" }}>No Services Found</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "5px" }}>
                    {searchTerm ? "No results match your search term." : "Start by registering a service in the Register tab!"}
                  </p>
                </div>
              ) : (
                <div className="table-card">
                  <table className="invoice-list-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Icon</th>
                        <th>Service / Catalog Description</th>
                        <th>Billing Rate</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((serv) => (
                        <tr key={serv._id}>
                          <td>
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: 700, fontSize: "1rem" }}>
                              ⚙️
                            </div>
                          </td>
                          <td>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)', display: 'block', lineHeight: '1.4' }}>{serv.name}</span>
                          </td>
                          <td className="font-bold" style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>
                            {Number(serv.rate).toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}>BDT</span>
                          </td>
                          <td className="text-right">
                            <button 
                              onClick={() => setDeleteConfirmId(serv._id)}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "6px 12px", transition: "transform 0.15s ease" }}
                              title="Delete Service"
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
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "5px" }}>Register Catalog Service</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "25px" }}>
              Add a service description and default BDT rate to pre-populate billing selections automatically.
            </p>

            <form onSubmit={handleAddService} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              
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
                <label className="input-label" style={{ fontSize: "0.85rem" }}>Service Name / Description *</label>
                <textarea 
                  className="form-input" 
                  placeholder="e.g. Graphic Design for Brand Identity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ minHeight: "100px", resize: "vertical" }}
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" style={{ fontSize: "0.85rem" }}>Default Billing Rate (BDT) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 5000"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: "100%", padding: "12px", marginTop: "10px", fontWeight: 700 }}
                disabled={isAdding}
              >
                {isAdding ? "Saving..." : "Save Catalog Item"}
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
              Are you sure you want to permanently remove this service from the catalog? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary"
                style={{ padding: '10px 20px', minWidth: '100px', justifyContent: 'center', margin: 0 }}>
                Cancel
              </button>
              <button
                onClick={() => { executeDeleteService(deleteConfirmId); setDeleteConfirmId(null); }}
                className="btn-primary"
                style={{ padding: '10px 20px', minWidth: '100px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
