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

    const invoice = await Invoice.findByIdAndUpdate(
      id, 
      { 
        $set: { status: 'active' },
        $unset: { deletedAt: 1 }
      },
      { new: true }
    );
    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Invoice restored successfully', invoice });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
