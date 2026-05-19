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

        {/* Cursive Signature & Stamp */}
        <div className="rds-signature-block">
          <p>Sincerely,</p>
          <div className="rds-signature-img">
            {/* Elegant Signature Drawing in SVG */}
            <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 35C20 32 30 15 35 12C40 9 45 28 42 35C38 42 25 45 28 35C32 22 55 18 60 15C65 12 70 25 68 30C66 35 75 22 80 20C85 18 90 28 92 32C94 36 100 25 105 25" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M30 25L50 25" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="rds-signee-name">{signeeName}</p>
          <p className="rds-signee-role">{signeeRole}</p>
        </div>
      </div>

      {/* Line art sketch at bottom right */}
      <div className="rds-footer-illustration">
        <svg viewBox="0 0 400 130" fill="none" className="rds-furniture-svg" xmlns="http://www.w3.org/2000/svg">
          {/* Lounge Chair */}
          <path d="M40 95L25 125" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M60 95L75 125" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M30 115L35 125" stroke="#555" strokeWidth="1.5"/>
          <path d="M55 115L50 125" stroke="#555" strokeWidth="1.5"/>
          
          {/* Chair cushion seat */}
          <path d="M20 75C20 65 30 60 45 60C60 60 70 65 70 75C70 85 65 95 45 95C25 95 20 85 20 75Z" fill="#fff" stroke="#333" strokeWidth="1.8"/>
          {/* Chair Backrest */}
          <path d="M25 62C22 50 25 25 40 25C50 25 58 45 55 62" stroke="#333" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          {/* Back cushion details */}
          <path d="M35 32C32 42 34 52 36 58" stroke="#777" strokeWidth="1" strokeLinecap="round"/>
          <path d="M45 32C43 42 44 52 45 58" stroke="#777" strokeWidth="1" strokeLinecap="round"/>

          {/* Side Table with vase */}
          <path d="M110 95L100 125" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M130 95L140 125" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M120 95L120 125" stroke="#555" strokeWidth="1" strokeLinecap="round"/>
          
          {/* Table Top */}
          <ellipse cx="120" cy="95" rx="25" ry="5" fill="#fff" stroke="#333" strokeWidth="1.8"/>
          
          {/* Small Vase & Plants */}
          <path d="M116 93V85C116 82 124 82 124 85V93H116Z" fill="#eee" stroke="#333" strokeWidth="1.2"/>
          {/* Plant Stems and Leaves */}
          <path d="M120 82C118 72 108 70 108 70" stroke="#333" strokeWidth="1" strokeLinecap="round"/>
          <path d="M120 82C123 74 132 72 132 72" stroke="#333" strokeWidth="1" strokeLinecap="round"/>
          <path d="M120 82C120 70 120 65 120 65" stroke="#333" strokeWidth="1" strokeLinecap="round"/>
          {/* Leaves shapes */}
          <path d="M108 70C110 68 114 69 114 72C111 74 109 73 108 70Z" fill="#ddd" stroke="#333" strokeWidth="0.8"/>
          <path d="M132 72C130 70 126 71 126 74C129 76 131 75 132 72Z" fill="#ddd" stroke="#333" strokeWidth="0.8"/>
          <path d="M120 65C118 63 118 59 120 59C122 59 122 63 120 65Z" fill="#ddd" stroke="#333" strokeWidth="0.8"/>

          {/* Modern Floor Lamp */}
          <path d="M175 125L170 125" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
          {/* Lamp Stand tripod */}
          <path d="M172 125L185 45" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M160 125L185 45" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M185 125L185 45" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Lamp Shade */}
          <path d="M170 45L200 45L205 20L165 20L170 45Z" fill="#fff" stroke="#333" strokeWidth="1.8" strokeLinejoin="round"/>
          {/* Bulb glow dashes */}
          <path d="M185 49V55" stroke="#e07a5f" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M175 51L171 55" stroke="#e07a5f" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M195 51L199 55" stroke="#e07a5f" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Black footer strip */}
      <div className="rds-footer-strip">
        <div className="rds-footer-info">
          <div className="rds-info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>01813 333 373</span>
          </div>
          <div className="rds-info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>info@rajseba.com</span>
          </div>
          <div className="rds-info-item rds-info-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>5th Floor, Incubation Center, Hi-Tech Park, Rajshahi, Bangladesh.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
