import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/db';
import Invoice from '@/lib/models/Invoice';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const invoice = await Invoice.findByIdAndUpdate(
      id, 
      { 
        status: 'trashed',
        deletedAt: new Date()
      },
      { new: true }
    );
    
    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Invoice moved to trash successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
