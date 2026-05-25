import Image from 'next/image';
import React from 'react';

interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

interface Customer {
  name: string;
  phone: string;
  email?: string;
  address: string;
}

interface PaymentOptions {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  routingNumber: string;
}

interface InvoiceTemplateProps {
  invoiceNumber: string;
  date: string;
  customer: Customer;
  items: InvoiceItem[];
  totalAmount: number;
  discount?: number;
  totalPayableAmount: number;
  amountInWords: string;
  paymentOptions?: PaymentOptions;
  signeeName?: string;
  signeeRole?: string;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus?: 'Paid' | 'Due';
}

export const InvoiceTemplate2: React.FC<InvoiceTemplateProps> = ({
  invoiceNumber,
  date,
  customer,
  items,
  totalAmount,
  discount = 0,
  totalPayableAmount,
  amountInWords,
  paymentOptions = {
    accountName: 'RAJSEBA.COM',
    accountNumber: '02433002451',
    bankName: 'Bank Asia PLC',
    branch: 'Rajshahi Branch',
    routingNumber: '070811937'
  },
  signeeName = 'Ariful Islam Arif',
  signeeRole = 'CEO, Rajseba',
  paidAmount = 0,
  dueAmount = 0,
  paymentStatus = 'Due'
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="partner-invoice-container">
      {/* Top Header Section */}
      <div className="partner-header">
        {/* Left: Logo Brand */}
        <div className="partner-logo-box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rajseba-logo.png"
            alt="Rajseba — Your Service Partner"
            className="partner-logo-img"
          />
        </div>

        {/* Right: Solid Blue Block Contact Info */}
        <div className="partner-contact-banner">
          <div className="partner-contact-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>+8801813333373</span>
          </div>
          <div className="partner-contact-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>info@rajseba.com</span>
          </div>
          <div className="partner-contact-item partner-address">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>5th floor, Incubation and Training Center, Rajshahi Hi-Tech Park, Rajshahi.</span>
          </div>
        </div>
      </div>

      {paymentStatus && (
        <div className={`invoice-badge ${paymentStatus.toLowerCase()}`}>
          {paymentStatus.toUpperCase()}
        </div>
      )}

      {/* Invoice Title */}
      <div className="partner-title-box">
        <h2>INVOICE</h2>
      </div>

      {/* Metadata Panel */}
      <div className="partner-meta-section">
        <div className="partner-meta-row">
          <span className="partner-meta-label">Date:</span>
          <span className="partner-meta-value">{formatDate(date)}</span>
        </div>
        <div className="partner-meta-row">
          <span className="partner-meta-label">Invoice #:</span>
          <span className="partner-meta-value">{invoiceNumber}</span>
        </div>
      </div>

      {/* Bill To Box */}
      <div className="partner-bill-box">
        <h4>BILL TO:</h4>
        <div className="partner-bill-grid">
          <div>
            <p className="partner-bill-label">Name:</p>
            <p className="partner-bill-val font-semibold">{customer.name}</p>
          </div>
          <div>
            <p className="partner-bill-label">Phone:</p>
            <p className="partner-bill-val">{customer.phone}</p>
          </div>
          <div>
            <p className="partner-bill-label">Address:</p>
            <p className="partner-bill-val">{customer.address}</p>
          </div>
        </div>
      </div>

      {/* Service Details Table */}
      <div className="partner-table-section">
        <h3>Service Details:</h3>
        <table className="partner-table">
          <thead>
            <tr>
              <th className="text-left">Description of Service</th>
              <th className="text-center" style={{ width: '100px' }}>Qty</th>
              <th className="text-right" style={{ width: '110px' }}>Rate (BDT)</th>
              <th className="text-right" style={{ width: '130px' }}>Amount (BDT)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="text-left font-medium">{item.description}</td>
                <td className="text-center">{item.qty}</td>
                <td className="text-right">{item.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="text-right font-medium">{(item.qty * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="partner-summary-box">
        <h4>Payment Summary:</h4>
        {discount > 0 && (
          <>
            <div className="partner-summary-row">
              <span className="partner-sum-dot">•</span>
              <span className="partner-sum-label">Subtotal:</span>
              <span className="partner-sum-val">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</span>
            </div>
            <div className="partner-summary-row">
              <span className="partner-sum-dot">•</span>
              <span className="partner-sum-label">Discount:</span>
              <span className="partner-sum-val">{discount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</span>
            </div>
          </>
        )}
        <div className="partner-summary-row">
          <span className="partner-sum-dot">•</span>
          <span className="partner-sum-label">Total Payable Amount:</span>
          <span className="partner-sum-val">{totalPayableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</span>
        </div>
        {paymentStatus === 'Due' ? (
          <>
            <div className="partner-summary-row">
              <span className="partner-sum-dot">•</span>
              <span className="partner-sum-label">Paid Amount:</span>
              <span className="partner-sum-val">{paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</span>
            </div>
            <div className="partner-summary-row partner-due-highlight">
              <span className="partner-sum-dot">•</span>
              <span className="partner-sum-label">Due Amount:</span>
              <span className="partner-sum-val">{dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</span>
            </div>
          </>
        ) : paymentStatus === 'Paid' ? (
          <>
            <div className="partner-summary-row">
              <span className="partner-sum-dot">•</span>
              <span className="partner-sum-label">Paid Amount:</span>
              <span className="partner-sum-val">{totalPayableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</span>
            </div>
            <div className="partner-summary-row">
              <span className="partner-sum-dot">•</span>
              <span className="partner-sum-label">Due Amount:</span>
              <span className="partner-sum-val">0.00 BDT</span>
            </div>
          </>
        ) : null}
        <div className="partner-summary-row">
          <span className="partner-sum-dot">•</span>
          <span className="partner-sum-label">In Words:</span>
          <span className="partner-sum-val capitalize">{amountInWords}</span>
        </div>
      </div>

      {/* Sincerely & Signature */}
      <div className="partner-bottom-row">
        <div className="partner-signature-block">
          <p>Sincerely,</p>
          <div className="partner-sig-img">
            {/* Elegant Signature Drawing in SVG */}
            <Image src="/signature.png" alt="Signature" width={150} height={100} />
          </div>
          <p className="partner-signee-name">{signeeName}</p>
          <p className="partner-signee-role">{signeeRole}</p>
        </div>
      </div>

      {/* Dynamic Overlapping Triangles Ribbon Footer */}
      <div className="partner-ribbon-footer">
        <svg viewBox="0 0 800 60" preserveAspectRatio="none" className="partner-ribbon-svg" xmlns="http://www.w3.org/2000/svg">
          {/* Blue triangles */}
          <polygon points="0,20 120,60 0,60" fill="#3b82f6" />
          <polygon points="120,60 220,15 280,60" fill="#2563eb" />
          {/* Orange triangle accents */}
          <polygon points="200,60 235,30 270,60" fill="#f97316" />
          {/* Main bottom long stripes */}
          <polygon points="260,60 400,0 520,60" fill="#3b82f6" />
          <polygon points="380,60 430,25 480,60" fill="#ea580c" />
          <polygon points="460,60 580,10 650,60" fill="#2563eb" />
          <polygon points="560,60 610,25 660,60" fill="#f97316" />
          <polygon points="630,60 800,0 800,60" fill="#3b82f6" />
          {/* Full bottom baseline bar */}
          <rect x="0" y="52" width="800" height="8" fill="#2563eb" />
        </svg>
      </div>
    </div>
  );
};
