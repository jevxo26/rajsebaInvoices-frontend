import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/db';
import Customer from '@/lib/models/Customer';

export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find({}).sort({ name: 1 });
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, phone, email, address } = body;

    if (!name || !phone || !address) {
      return NextResponse.json(
        { message: 'Name, phone, and address are required' },
        { status: 400 }
      );
    }

    const customer = await Customer.findOneAndUpdate(
      { phone: phone.trim() },
      { name: name.trim(), email: email ? email.trim() : '', address: address.trim() },
      { new: true, upsert: true, runValidators: true }
    );
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
