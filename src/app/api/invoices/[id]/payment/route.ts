import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/lib/models/Invoice';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { amountPaid } = body;
    const paymentValue = Number(amountPaid);

    if (isNaN(paymentValue) || paymentValue <= 0) {
      return NextResponse.json({ message: 'Invalid payment amount. Must be a positive number.' }, { status: 400 });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    const currentPaid = invoice.paidAmount || 0;
    const total = invoice.totalPayableAmount || invoice.totalAmount;
    
    // Capping at total payable
    const newPaid = Math.min(total, currentPaid + paymentValue);
    const newDue = Math.max(0, total - newPaid);
    const newStatus = newDue === 0 ? 'Paid' : 'Due';

    invoice.paidAmount = newPaid;
    invoice.dueAmount = newDue;
    invoice.paymentStatus = newStatus;

    const updatedInvoice = await invoice.save();
    return NextResponse.json(updatedInvoice);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
