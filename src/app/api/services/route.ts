import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/lib/models/Service';

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({}).sort({ name: 1 });
    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, rate } = body;

    if (!name || rate === undefined) {
      return NextResponse.json(
        { message: 'Service name and rate are required' },
        { status: 400 }
      );
    }

    const service = await Service.findOneAndUpdate(
      { name: name.trim() },
      { rate: Number(rate) },
      { new: true, upsert: true, runValidators: true }
    );
    
    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
