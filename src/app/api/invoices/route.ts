import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import Customer from '@/lib/models/Customer';
import Service from '@/lib/models/Service';

export async function GET() {
  try {
    await connectDB();
    const invoices = await Invoice.find({ status: { $ne: 'trashed' } }).sort({ date: -1, createdAt: -1 });
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      invoiceNumber, date, customer, items, totalAmount, discount, totalPayableAmount,
      amountInWords, templateName, paymentOptions, signeeName, signeeRole,
      paidAmount, dueAmount, paymentStatus
    } = body;

    if (!invoiceNumber || !customer || !items || items.length === 0 || !amountInWords) {
      return NextResponse.json(
        { message: 'Invoice number, customer, items, and amount in words are required' },
        { status: 400 }
      );
    }

    // 1. Dynamic Customer Creation/Upsert
    if (customer.name && customer.phone && customer.address) {
      await Customer.findOneAndUpdate(
        { phone: customer.phone.trim() },
        { 
          name: customer.name.trim(), 
          email: customer.email ? customer.email.trim() : '', 
          address: customer.address.trim() 
        },
        { new: true, upsert: true }
      );
    }

    // 2. Dynamic Service Creation
    for (const item of items) {
      if (item.description && item.rate > 0) {
        await Service.findOneAndUpdate(
          { name: item.description.trim() },
          { rate: Number(item.rate) },
          { new: true, upsert: true }
        );
      }
    }

    // 3. Create and Save the Invoice
    const invoice = new Invoice({
      invoiceNumber: invoiceNumber.trim(),
      date: date ? new Date(date) : new Date(),
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email ? customer.email.trim() : '',
        address: customer.address.trim()
      },
      items: items.map((item: any) => ({
        description: item.description.trim(),
        qty: Number(item.qty),
        rate: Number(item.rate),
        amount: Number(item.amount || (item.qty * item.rate))
      })),
      totalAmount: Number(totalAmount || items.reduce((acc: number, curr: any) => acc + (curr.qty * curr.rate), 0)),
      discount: Number(discount) || 0,
      totalPayableAmount: Number(totalPayableAmount || items.reduce((acc: number, curr: any) => acc + (curr.qty * curr.rate), 0)),
      amountInWords: amountInWords.trim(),
      templateName: templateName || 'template1',
      paymentOptions: paymentOptions || {
        accountName: 'RAJSEBA.COM',
        accountNumber: '02433002451',
        bankName: 'Bank Asia PLC',
        branch: 'Rajshahi Branch',
        routingNumber: '070811937'
      },
      signeeName: signeeName ? signeeName.trim() : 'Ariful Islam Arif',
      signeeRole: signeeRole ? signeeRole.trim() : 'CEO, Rajseba Design Studio',
      paidAmount: Number(paidAmount) || 0,
      dueAmount: Number(dueAmount) || 0,
      paymentStatus: paymentStatus || 'Due'
    });

    const savedInvoice = await invoice.save();
    return NextResponse.json(savedInvoice, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: `Invoice number already exists.` }, { status: 400 });
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
