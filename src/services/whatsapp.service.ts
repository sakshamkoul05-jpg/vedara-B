import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

interface WhatsAppBookingAlert {
  bookingRef: string;
  guestName: string;
  guestPhone: string;
  cottageName: string;
  checkIn: Date;
  checkOut: Date;
  amount: number;
}

class WhatsAppService {
  private apiUrl: string;
  private apiKey: string;
  private toNumber: string;
  private enabled: boolean;

  constructor() {
    this.apiUrl = config.whatsapp.apiUrl || '';
    this.apiKey = config.whatsapp.apiKey || '';
    this.toNumber = config.whatsapp.toNumber || '';
    this.enabled = !!(this.apiUrl && this.apiKey && this.toNumber);
  }

  private async sendTextMessage(text: string) {
    if (!this.enabled) {
      logger.info('WhatsApp not configured — skipping message', { text: text.substring(0, 50) });
      return;
    }

    try {
      await axios.post(
        `${this.apiUrl}/api/v1/sendSessionMessage/${this.toNumber}`,
        { messageText: text },
        {
          headers: {
            Authorization: `${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      logger.info('WhatsApp message sent', { to: this.toNumber });
    } catch (error: any) {
      logger.error('WhatsApp send failed', {
        to: this.toNumber,
        error: error?.message || error,
      });
    }
  }

  async sendBookingAlert(data: WhatsAppBookingAlert) {
    const checkInStr = new Date(data.checkIn).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    const checkOutStr = new Date(data.checkOut).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

    const message = `🏔️ *New Booking at The Vedara!*

📋 *Ref:* ${data.bookingRef}
👤 *Guest:* ${data.guestName}
📞 *Phone:* ${data.guestPhone}
🏡 *Cottage:* ${data.cottageName}
📅 *Check-in:* ${checkInStr}
📅 *Check-out:* ${checkOutStr}
💰 *Amount:* ₹${data.amount.toLocaleString('en-IN')}`;

    await this.sendTextMessage(message);
  }

  async sendCancellationAlert(bookingRef: string, guestName: string, cottageName: string) {
    const message = `❌ *Booking Cancelled at The Vedara*

📋 *Ref:* ${bookingRef}
👤 *Guest:* ${guestName}
🏡 *Cottage:* ${cottageName}`;

    await this.sendTextMessage(message);
  }

  async sendContactAlert(name: string, phone: string, message: string) {
    const text = `📬 *New Contact Message*
👤 ${name} | 📞 ${phone}
📝 ${message}`;

    await this.sendTextMessage(text);
  }
}

export const whatsappService = new WhatsAppService();
