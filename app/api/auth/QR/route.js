import { NextResponse } from 'next/server';
import { getQRCode } from '@/lib/whatsapp';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('senderId');
    
    if (!senderId) {
      return NextResponse.json(
        { success: false, error: 'senderId is required' },
        { status: 400 }
      );
    }

    const qrCode = getQRCode(parseInt(senderId));
    
    return NextResponse.json({
      success: true,
      qrCode,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
