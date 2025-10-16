import { NextResponse } from 'next/server';
import { Sender, initDB } from '@/lib/db';
import { initSenderConnection, getQRCode } from '@/lib/whatsapp';

await initDB();

export async function GET() {
  try {
    const senders = await Sender.findAll({
      order: [['createdAt', 'DESC']]
    });
    return NextResponse.json({ success: true, senders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { phone, name } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const sender = await Sender.create({
      phone: phone.replace(/\D/g, ''),
      name: name || `Sender ${phone}`
    });

    // Initialize WhatsApp connection
    const result = await initSenderConnection(sender.id);

    return NextResponse.json({
      success: true,
      sender,
      qrCode: result.qrCode
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
