import { NextResponse } from 'next/server';
import { sendBugCommand } from '@/lib/whatsapp';
import { BugHistory, initDB } from '@/lib/db';

await initDB();

export async function POST(request) {
  try {
    const { target, bugType, senderId } = await request.json();

    if (!target || !bugType || !senderId) {
      return NextResponse.json(
        { success: false, error: 'Target, bugType, and senderId are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    const cleanTarget = target.replace(/\D/g, '');
    if (cleanTarget.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Send bug command
    const result = await sendBugCommand(senderId, cleanTarget, bugType);

    // Save to history
    await BugHistory.create({
      target: cleanTarget,
      bugType,
      senderId,
      status: result.success ? 'sent' : 'failed'
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          target: cleanTarget,
          bugType,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
