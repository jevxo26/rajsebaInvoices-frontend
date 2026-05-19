"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';
import { numberToWords } from '../../utils/numberToWords';

interface SavedCustomer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
}

interface SavedService {
  _id: string;
  name: string;
  rate: number;
}

interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export default function CreateInvoice() {
  const router = useRouter();

  // Reference database lists
  const [savedCustomers, setSavedCustomers] = useState<SavedCustomer[]>([]);
  const [savedServices, setSavedServices] = useState<SavedService[]>([]);

  // Search & suggestions dropdown states
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [activeItemRowIdx, setActiveItemRowIdx] = useState<number | null>(null);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // Form core states
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', qty: 1, rate: 0, amount: 0 }
  ]);

  const [templateName, setTemplateName] = useState<'template1' | 'template2'>('template1');
  const [signeeName, setSigneeName] = useState('Ariful Islam Arif');
  const [signeeRole, setSigneeRole] = useState('CEO, Rajseba Design Studio');

  const [paymentOptions, setPaymentOptions] = useState({
    accountName: 'RAJSEBA.COM',
    accountNumber: '02433002451',
    bankName: 'Bank Asia PLC',
    branch: 'Rajshahi Branch',
    routingNumber: '070811937'
  });

  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Due'>('Due');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Refs for outside click handling
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  // 1. Initial loads and auto-generating defaults
  useEffect(() => {
    // Set default date (today)
    const today = new Date().toISOString().split('T')[0];
    setDate(today);

    // Auto-generate invoice number (e.g. INV-RDS-2026-030)
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(100 + Math.random() * 900); // 3 digit random
    setInvoiceNumber(`INV-RDS-${year}-${randomSeq}`);

    // Fetch saved customers & services
    const fetchData = async () => {
      try {
        const custRes = await fetch(`${API_BASE_URL}/api/customers`);
        if (custRes.ok) {
          const custData = await custRes.json();
          setSavedCustomers(custData);
        }

        const servRes = await fetch(`${API_BASE_URL}/api/services`);
        if (servRes.ok) {
          const servData = await servRes.json();
          setSavedServices(servData);
        }
      } catch (err) {
        console.error('Error fetching dynamic suggestions:', err);
      }
    };

    fetchData();
  }, []);

  // Set the default role based on template
  useEffect(() => {
    if (templateName === 'template1') {
      setSigneeRole('CEO, Rajseba Design Studio');
    } else {
      setSigneeRole('CEO, Rajseba');
    }
  }, [templateName]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Calculations
  const grandTotal = items.reduce((acc, curr) => acc + curr.amount, 0);
  const grandTotalInWords = numberToWords(grandTotal);
  const dueAmount = paymentStatus === 'Paid' ? 0 : Math.max(0, grandTotal - paidAmount);

  // Sync paidAmount with grandTotal when marked as Paid
  useEffect(() => {
    if (paymentStatus === 'Paid') {
      setPaidAmount(grandTotal);
    }
  }, [paymentStatus, grandTotal]);

  // 3. Customer handlers
  const handleSelectCustomer = (cust: SavedCustomer) => {
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone);
    setCustomerEmail(cust.email || '');
    setCustomerAddress(cust.address);
    setCustomerSearchTerm(cust.name);
    setShowCustomerDropdown(false);
    setIsNewCustomer(false);
  };

  const handleToggleNewCustomer = (checked: boolean) => {
    setIsNewCustomer(checked);
    if (checked) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerAddress('');
      setCustomerSearchTerm('');
    }
  };

  // 4. Items table handlers
  const handleAddItemRow = () => {
    setItems([...items, { description: '', qty: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
  };

  const handleItemFieldChange = (idx: number, field: keyof InvoiceItem, val: string | number) => {
    const updated = [...items];
    const item = updated[idx];

    if (field === 'description') {
      item.description = val as string;
      setActiveItemRowIdx(idx);
      setShowServiceDropdown(true);
    } else if (field === 'qty') {
      item.qty = Number(val);
      item.amount = item.qty * item.rate;
    } else if (field === 'rate') {
      item.rate = Number(val);
      item.amount = item.qty * item.rate;
    }

    setItems(updated);
  };

  const handleSelectService = (idx: number, serv: SavedService) => {
    const updated = [...items];
    updated[idx].description = serv.name;
    updated[idx].rate = serv.rate;
    updated[idx].amount = updated[idx].qty * serv.rate;
    setItems(updated);
    setShowServiceDropdown(false);
    setActiveItemRowIdx(null);
  };

  // 5. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    if (!customerName || !customerPhone || !customerAddress) {
      setErrorMsg('Customer name, phone, and address are required.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      invoiceNumber,
      date,
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress
      },
      items,
      totalAmount: grandTotal,
      totalPayableAmount: grandTotal,
      amountInWords: grandTotalInWords,
      templateName,
      paymentOptions,
      signeeName,
      signeeRole,
      paidAmount: paymentStatus === 'Paid' ? grandTotal : paidAmount,
      dueAmount,
      paymentStatus
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to create invoice');
      }

      // Success -> Redirect to invoice page where window.print() will trigger
      router.push(`/invoice/${resData._id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to backend server.');
      setIsSubmitting(false);
    }
  };

  // Filter suggestions
  const filteredCustomers = savedCustomers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.phone.includes(customerSearchTerm)
  );

  const activeRowDesc = activeItemRowIdx !== null ? items[activeItemRowIdx].description : '';
  const filteredServices = savedServices.filter(s => 
    s.name.toLowerCase().includes(activeRowDesc.toLowerCase())
  );

  return (
    <main className="form-container">
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontSize: '0.9rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Dashboard
        </Link>
      </div>



      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '8px', padding: '15px 20px', marginBottom: '25px' }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Main workspace cards */}
          <div>
            {/* Invoice Configuration Card */}
            <div className="form-card">
              <h3 className="form-card-title">Invoice Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="input-group">
                  <label className="input-label">Invoice Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={invoiceNumber} 
                    onChange={e => setInvoiceNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Invoice Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Customer Workspace Card */}
            <div className="form-card" ref={customerDropdownRef}>
              <h3 className="form-card-title">Billing Customer Details</h3>

              {/* Selector / Inline Hub */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <label className="input-label" style={{ margin: 0 }}>
                  {isNewCustomer ? 'New Customer Registration' : 'Select Existing Customer'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="newCustCheck"
                    checked={isNewCustomer}
                    onChange={e => handleToggleNewCustomer(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="newCustCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Create New Customer Inline
                  </label>
                </div>
              </div>

              {!isNewCustomer ? (
                /* Existing Customer dropdown search */
                <div className="input-group select-dropdown-container">
                  <label className="input-label">Search Customer List</label>
                  <input 
                    type="text" 
                    placeholder="Type to search name or phone number..." 
                    className="form-input"
                    value={customerSearchTerm}
                    onChange={e => {
                      setCustomerSearchTerm(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="dropdown-suggestions">
                      {filteredCustomers.map(c => (
                        <div 
                          key={c._id} 
                          className="dropdown-item"
                          onClick={() => handleSelectCustomer(c)}
                        >
                          <strong>{c.name}</strong> - {c.phone} ({c.address})
                        </div>
                      ))}
                    </div>
                  )}
                  {showCustomerDropdown && customerSearchTerm.trim() && filteredCustomers.length === 0 && (
                    <div className="dropdown-suggestions" style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      No matching customers found. Click <strong>"Create New Customer Inline"</strong> above to write dynamic details!
                    </div>
                  )}
                </div>
              ) : null}

              {/* Dynamic input fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="input-group">
                  <label className="input-label">Customer Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Dr. Alif"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 01521421010"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="input-group">
                  <label className="input-label">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. customer@gmail.com"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Sopura, Rajshahi"
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Service details and table card */}
            <div className="form-card" ref={serviceDropdownRef}>
              <h3 className="form-card-title">Service / Work Details</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Description of Service</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                      <th style={{ width: '18%', textAlign: 'right' }}>Rate (BDT)</th>
                      <th style={{ width: '18%', textAlign: 'right' }}>Amount (BDT)</th>
                      <th style={{ width: '4%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} style={{ position: 'relative' }}>
                        <td>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Type service (e.g. Interior Design)"
                              value={item.description}
                              onChange={e => handleItemFieldChange(idx, 'description', e.target.value)}
                              onFocus={() => {
                                setActiveItemRowIdx(idx);
                                setShowServiceDropdown(true);
                              }}
                              required
                            />
                            {/* Suggestions Dropdown */}
                            {showServiceDropdown && activeItemRowIdx === idx && (
                              <div className="dropdown-suggestions" style={{ width: '100%' }}>
                                {filteredServices.length > 0 ? (
                                  filteredServices.map(s => (
                                    <div 
                                      key={s._id} 
                                      className="dropdown-item"
                                      onClick={() => handleSelectService(idx, s)}
                                    >
                                      <strong>{s.name}</strong> - {Number(s.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT
                                    </div>
                                  ))
                                ) : (
                                  <div className="dropdown-item" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'default', padding: '10px 12px' }}>
                                    No matches. Keep typing to add custom service!
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-input text-center" 
                            min="1"
                            value={item.qty}
                            onChange={e => handleItemFieldChange(idx, 'qty', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-input text-right" 
                            min="0"
                            step="any"
                            value={item.rate}
                            onChange={e => handleItemFieldChange(idx, 'rate', e.target.value)}
                            required
                          />
                        </td>
                        <td className="text-right font-medium" style={{ paddingRight: '10px' }}>
                          {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className="btn-danger"
                            onClick={() => handleRemoveItemRow(idx)}
                            disabled={items.length === 1}
                            style={{ padding: '6px 10px', fontSize: '0.75rem', opacity: items.length === 1 ? 0.3 : 1 }}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleAddItemRow}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                + Add Service Row
              </button>

              <div className="totals-panel">
                <div className="total-row grand">
                  <span>Total Payable:</span>
                  <span style={{ color: '#60a5fa' }}>{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</span>
                </div>

                {/* Payment Status controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '15px', marginTop: '15px', borderTop: '1px solid var(--border-card)', paddingTop: '15px', textAlign: 'left' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Payment Status</label>
                    <select
                      className="form-input"
                      value={paymentStatus}
                      onChange={e => setPaymentStatus(e.target.value as 'Paid' | 'Due')}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="Due">Due / Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  
                  {paymentStatus === 'Due' && (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Paid Amount (BDT)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 5000"
                        min="0"
                        max={grandTotal}
                        value={paidAmount || ''}
                        onChange={e => setPaidAmount(Number(e.target.value))}
                      />
                    </div>
                  )}
                </div>
                
                {paymentStatus === 'Due' && (
                  <div style={{ color: '#f87171', fontSize: '0.95rem', fontWeight: 600, width: '100%', textAlign: 'right', marginTop: '10px' }}>
                    Due Amount: {dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT
                  </div>
                )}

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', width: '100%', textAlign: 'right', marginTop: '10px' }}>
                  <strong>In Words:</strong> <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>{grandTotalInWords}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar options */}
          <div>
            {/* Visual template card selector */}
            <div className="form-card">
              <h3 className="form-card-title">Choose Template</h3>
              <div className="templates-selector-grid">
                <div 
                  className={`template-card-option ${templateName === 'template1' ? 'selected' : ''}`}
                  onClick={() => setTemplateName('template1')}
                >
                  <div style={{ width: '100%', height: '70px', background: '#222', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>RDS Studio</span>
                  </div>
                  <h4>RDS Style</h4>
                  <p>Line Art & Cursive</p>
                </div>
                <div 
                  className={`template-card-option ${templateName === 'template2' ? 'selected' : ''}`}
                  onClick={() => setTemplateName('template2')}
                >
                  <div style={{ width: '100%', height: '70px', background: '#1e3a8a', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>Partner Blue</span>
                  </div>
                  <h4>Partner Style</h4>
                  <p>Blue Banner & Ribbons</p>
                </div>
              </div>
            </div>

            {/* Account Settings Pre-fills */}
            <div className="form-card">
              <h3 className="form-card-title">Payment / Signee Defaults</h3>
              <div className="input-group">
                <label className="input-label">Signee Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={signeeName}
                  onChange={e => setSigneeName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Signee Role</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={signeeRole}
                  onChange={e => setSigneeRole(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-card)', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>Bank Details</h4>
                <div className="input-group">
                  <label className="input-label">Account Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={paymentOptions.accountName}
                    onChange={e => setPaymentOptions({ ...paymentOptions, accountName: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Account Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={paymentOptions.accountNumber}
                    onChange={e => setPaymentOptions({ ...paymentOptions, accountNumber: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Bank Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={paymentOptions.bankName}
                    onChange={e => setPaymentOptions({ ...paymentOptions, bankName: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Branch Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={paymentOptions.branch}
                    onChange={e => setPaymentOptions({ ...paymentOptions, branch: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Routing Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={paymentOptions.routingNumber}
                    onChange={e => setPaymentOptions({ ...paymentOptions, routingNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="submit" 
                className="btn-accent"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '15px', fontSize: '1.05rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Creating Records...' : 'Create & Print Invoice'}
              </button>
              <Link href="/" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
