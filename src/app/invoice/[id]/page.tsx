"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';
import { InvoiceTemplate1 } from '../../../components/InvoiceTemplate1';
import { InvoiceTemplate2 } from '../../../components/InvoiceTemplate2';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  items: Array<{
    description: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
  totalAmount: number;
  totalPayableAmount: number;
  amountInWords: string;
  templateName: 'template1' | 'template2';
  paymentOptions?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    routingNumber: string;
  };
  signeeName?: string;
  signeeRole?: string;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus?: 'Paid' | 'Due';
}

export default function ViewInvoice() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInput, setPaymentInput] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Ref for PDF generation
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`);
        if (!response.ok) {
          throw new Error('Invoice not found');
        }
        const data = await response.json();
        setInvoice(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  // Direct PDF download using html2pdf.js
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    const element = contentRef.current;
    const opt = {
      margin: 0,
      filename: `invoice-${invoice?.invoiceNumber || 'download'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(element).save();
  };

  // Submit payment update to backend
  const handleUpdatePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    const amount = Number(paymentInput);

    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Please enter a valid positive payment amount.');
      return;
    }

    const currentDue = invoice ? (invoice.dueAmount ?? (invoice.totalPayableAmount - (invoice.paidAmount ?? 0))) : 0;
    if (amount > currentDue) {
      setPaymentError(`Payment amount cannot exceed the remaining due of ${currentDue.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT.`);
      return;
    }

    setIsUpdatingPayment(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amountPaid: amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment.');
      }

      const updatedInvoice = await response.json();
      setInvoice(updatedInvoice);
      setShowPaymentModal(false);
      setPaymentInput('');
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(15, 23, 42, 0.1)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading high-fidelity invoice...</p>
        <p style={{ fontSize: '0.85rem' }}>Preparing layout elements and auto-print triggers</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={{
        maxWidth: '500px',
        margin: '100px auto',
        padding: '30px',
        background: 'var(--bg-card)',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ marginBottom: '15px' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '10px' }}>Failed to render invoice</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>{error || 'The requested invoice was not found.'}</p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '50px', background: 'var(--bg-app)', minHeight: '100vh' }} className="invoice-view-wrapper">
      {/* Floating Controls Dashboard Panel (Hidden on Print) */}
      <div className="no-print" style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-card)',
        padding: '15px 30px',
        position: 'fixed',
        top: '91px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '950px',
        borderRadius: '0 0 12px 12px',
        boxShadow: 'var(--shadow-premium)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Dashboard
          </Link>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Invoice: <strong style={{ color: 'var(--text-primary)' }}>{invoice.invoiceNumber}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {invoice.paymentStatus === 'Due' && (
            <button
              onClick={() => {
                setPaymentError(null);
                setPaymentInput('');
                setShowPaymentModal(true);
              }}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderColor: '#f97316' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px', display: 'inline', verticalAlign: 'middle' }}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="12" y1="10" x2="12" y2="10" />
                <path d="M16 10h.01M8 10h.01M2 14h20" />
              </svg>
              Update Payment
            </button>
          )}
          <button onClick={handlePrint} className="btn-accent" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px', display: 'inline', verticalAlign: 'middle' }}>
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print Again
          </button>
          <button onClick={handleDownloadPDF} className="btn-accent" style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', borderColor: '#2563eb' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px', display: 'inline', verticalAlign: 'middle' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download PDF
          </button>
          <Link href="/create" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>
            Create New
          </Link>
        </div>
      </div>

      {/* High Fidelity Template Rendering */}
      <div ref={contentRef} className="invoice-render-wrapper">
        {invoice.templateName === 'template1' ? (
          <InvoiceTemplate1
            invoiceNumber={invoice.invoiceNumber}
            date={invoice.date}
            customer={invoice.customer}
            items={invoice.items}
            totalAmount={invoice.totalAmount}
            totalPayableAmount={invoice.totalPayableAmount}
            amountInWords={invoice.amountInWords}
            paymentOptions={invoice.paymentOptions}
            signeeName={invoice.signeeName}
            signeeRole={invoice.signeeRole}
            paidAmount={invoice.paidAmount}
            dueAmount={invoice.dueAmount}
            paymentStatus={invoice.paymentStatus}
          />
        ) : (
          <InvoiceTemplate2
            invoiceNumber={invoice.invoiceNumber}
            date={invoice.date}
            customer={invoice.customer}
            items={invoice.items}
            totalAmount={invoice.totalAmount}
            totalPayableAmount={invoice.totalPayableAmount}
            amountInWords={invoice.amountInWords}
            paymentOptions={invoice.paymentOptions}
            signeeName={invoice.signeeName}
            signeeRole={invoice.signeeRole}
            paidAmount={invoice.paidAmount}
            dueAmount={invoice.dueAmount}
            paymentStatus={invoice.paymentStatus}
          />
        )}
      </div>

      {/* Payment Update Modal Overlay */}
      {showPaymentModal && (
        <div className="payment-modal-overlay no-print" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal-container" onClick={e => e.stopPropagation()}>
            <div className="payment-modal-title">Receive Due Payment</div>
            <div className="payment-modal-subtitle">
              Record a payment received for invoice <strong>{invoice.invoiceNumber}</strong> to update outstanding due balances.
            </div>

            <div className="payment-modal-outstanding">
              <span className="payment-modal-outstanding-label">Remaining Due</span>
              <span className="payment-modal-outstanding-val">
                {(invoice.dueAmount ?? (invoice.totalPayableAmount - (invoice.paidAmount ?? 0))).toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT
              </span>
            </div>

            {paymentError && (
              <div className="payment-modal-error">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleUpdatePaymentSubmit}>
              <div className="input-group">
                <label className="input-label">Payment Amount (BDT)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2000"
                  min="0.01"
                  step="0.01"
                  max={invoice.dueAmount ?? (invoice.totalPayableAmount - (invoice.paidAmount ?? 0))}
                  value={paymentInput}
                  onChange={e => setPaymentInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  disabled={isUpdatingPayment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  disabled={isUpdatingPayment}
                >
                  {isUpdatingPayment ? 'Updating...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
