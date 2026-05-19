import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/db';
import Invoice from '@/lib/models/Invoice';

export async function GET() {
  try {
    await connectDB();
    const invoices = await Invoice.find({ status: 'trashed' }).sort({ deletedAt: -1, date: -1 });
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
