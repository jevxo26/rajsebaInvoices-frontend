import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Customer from '@/lib/models/Customer';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // In App Router, params must be awaited in some Next.js versions (15+), 
    // but in 13/14 it's synchronous. Let's destructure safely.
    // Let's await it to be safe for Next 15.
    const { id } = await params;

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
