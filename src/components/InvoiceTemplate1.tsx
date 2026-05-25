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

export const InvoiceTemplate1: React.FC<InvoiceTemplateProps> = ({
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
  signeeRole = 'CEO, Rajseba Design Studio',
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
    <div className="rds-invoice-container">
      {/* Top Header */}
      <div className="rds-header">
        <div className="rds-logo-section">
          {/* Recreating RDS Logo in clean SVG + Modern Typography */}
          <div className="rds-logo-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/rds-logo.png"
              alt="Rajseba Design Studio"
              className="rds-logo-img"
            />
          </div>
          <div className="rds-vertical-line"></div>
          <div className="rds-tagline">
            <h3>RAJSEBA DESIGN STUDIO</h3>
            <p>Your Dream, Our Design.</p>
          </div>
        </div>
      </div>

      {paymentStatus && (
        <div className={`invoice-badge ${paymentStatus.toLowerCase()}`}>
          {paymentStatus.toUpperCase()}
        </div>
      )}

      <hr className="rds-divider" />

      {/* Invoice Title */}
      <div className="rds-title-box">
        <h2>INVOICE</h2>
      </div>

      {/* Metadata & Bill To Grid */}
      <div className="rds-meta-grid">
        <div className="rds-meta-left">
          <p><strong>Date:</strong> {formatDate(date)}</p>
          <p><strong>Invoice #:</strong> {invoiceNumber}</p>
        </div>
        <div className="rds-bill-to">
          <h4>BILL TO:</h4>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          {customer.email && <p><strong>Email:</strong> {customer.email}</p>}
          <p><strong>Address:</strong> {customer.address}</p>
        </div>
      </div>

      {/* Service Details Table */}
      <div className="rds-table-section">
        <h3>Service Details:</h3>
        <table className="rds-table">
          <thead>
            <tr>
              <th className="text-left">Description of Service</th>
              <th className="text-center" style={{ width: '90px' }}>Qty</th>
              <th className="text-right" style={{ width: '100px' }}>Rate (BDT)</th>
              <th className="text-right" style={{ width: '120px' }}>Amount (BDT)</th>
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

      {/* Payment Summary */}
      <div className="rds-summary-section">
        <h3>Payment Summary</h3>
        <ul className="rds-summary-list">
          {discount > 0 && (
            <>
              <li><strong>Subtotal:</strong> {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</li>
              <li><strong>Discount:</strong> {discount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</li>
            </>
          )}
          <li><strong>Total Payable Amount:</strong> {totalPayableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</li>
          {paymentStatus === 'Due' ? (
            <>
              <li><strong>Paid Amount:</strong> {paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</li>
              <li className="due-highlight"><strong>Due Amount:</strong> {dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</li>
            </>
          ) : paymentStatus === 'Paid' ? (
            <>
              <li><strong>Paid Amount:</strong> {totalPayableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} BDT</li>
              <li><strong>Due Amount:</strong> 0.00 BDT</li>
            </>
          ) : null}
          <li><strong>In Words:</strong> {amountInWords}</li>
        </ul>
      </div>

      {/* Payment Options & Footer sketch */}
      <div className="rds-bottom-wrapper">
        <div className="rds-payment-options">
          <h3>Payment Options:</h3>
          <ul>
            <li><strong>Account Name:</strong> {paymentOptions.accountName}</li>
            <li><strong>Account Number:</strong> {paymentOptions.accountNumber}</li>
            <li><strong>Bank Name:</strong> {paymentOptions.bankName}</li>
            <li><strong>Branch:</strong> {paymentOptions.branch}</li>
            <li><strong>Routing Number:</strong> {paymentOptions.routingNumber}</li>
          </ul>
        </div>

        {/* Signature & Stamp */}
        <div className="rds-signature-block">
          <p>Sincerely,</p>
          <div className="rds-signature-img">
            {/* Elegant Signature Drawing in SVG */}
            <Image src="/signature.png" alt="Signature" width={150} height={100} />
          </div>
          <p className="rds-signee-name">{signeeName}</p>
          <p className="rds-signee-role">{signeeRole}</p>
        </div>
      </div>

      {/* Line art sketch at bottom right */}
      <div className="rds-footer-illustration">
        <Image 
          src="/furniture.png" 
          alt="Furniture Illustration" 
          width={280}
          height={280}
          style={{ objectFit: 'contain', objectPosition: 'bottom right', mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Black footer strip */}
      <div className="rds-footer-strip">
        <div className="rds-footer-info">
          <div className="rds-info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>01813 333 373</span>
          </div>
          <div className="rds-info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>info@rajseba.com</span>
          </div>
          <div className="rds-info-item rds-info-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>5th Floor, Incubation Center, Hi-Tech Park, Rajshahi, Bangladesh.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
