import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  private async send(options: { to: string; subject: string; html: string }) {
    try {
      await this.transporter.sendMail({
        from: `"The Vedara" <${config.smtp.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      logger.info('Email sent', { to: options.to, subject: options.subject });
    } catch (error) {
      logger.error('Email send failed', { to: options.to, error });
    }
  }

  async sendBookingConfirmation(
    email: string,
    bookingRef: string,
    guestName: string,
    cottageName: string,
    checkIn: Date,
    checkOut: Date,
    amount: number
  ) {
    const html = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf6f0; padding: 40px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4a3728; font-size: 28px; margin: 0;">The Vedara</h1>
          <p style="color: #8b7355; font-size: 14px;">A Himalayan Boutique Retreat</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #2d5a3d; margin-top: 0;">Booking Confirmed</h2>
          <p style="color: #4a3728; font-size: 16px; line-height: 1.6;">Dear ${guestName},</p>
          <p style="color: #4a3728; font-size: 16px; line-height: 1.6;">Your stay at <strong>${cottageName}</strong> is confirmed.</p>
          <table style="width: 100%; margin: 20px 0;">
            <tr><td style="padding: 8px 0; color: #8b7355;">Booking Reference</td><td style="padding: 8px 0; font-weight: bold;">${bookingRef}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Check-in</td><td style="padding: 8px 0;">${checkIn.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Check-out</td><td style="padding: 8px 0;">${checkOut.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Amount Paid</td><td style="padding: 8px 0; font-weight: bold;">₹${amount.toLocaleString('en-IN')}</td></tr>
          </table>
          <p style="color: #8b7355; font-size: 14px;">Reception hours: 8:00 AM to 10:30 PM. For any queries, call +91-91188-82242.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #8b7355; font-size: 12px;">
          <p>The Vedara — Ghiyagi, Jibhi, Himachal Pradesh 175123</p>
        </div>
      </div>
    `;
    await this.send({ to: email, subject: `Booking Confirmed — ${bookingRef}`, html });
  }

  async sendAdminBookingAlert(
    bookingRef: string,
    guestName: string,
    guestEmail: string,
    guestPhone: string,
    cottageName: string,
    checkIn: Date,
    checkOut: Date,
    amount: number
  ) {
    const html = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf6f0; padding: 40px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2d5a3d; font-size: 22px; margin: 0;">🔔 New Booking Alert</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8b7355;">Reference</td><td style="padding: 8px 0; font-weight: bold;">${bookingRef}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Guest</td><td style="padding: 8px 0;">${guestName}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Email</td><td style="padding: 8px 0;">${guestEmail || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Phone</td><td style="padding: 8px 0;">${guestPhone || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Cottage</td><td style="padding: 8px 0; font-weight: bold;">${cottageName}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Check-in</td><td style="padding: 8px 0;">${checkIn.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Check-out</td><td style="padding: 8px 0;">${checkOut.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
            <tr><td style="padding: 8px 0; color: #8b7355;">Amount</td><td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #2d5a3d;">₹${amount.toLocaleString('en-IN')}</td></tr>
          </table>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #8b7355; font-size: 12px;">
          <p>Login to <a href="https://vedara.com/admin/dashboard" style="color: #2d5a3d;">admin panel</a> to manage this booking.</p>
        </div>
      </div>
    `;
    await this.send({ to: config.adminEmail, subject: `New Booking — ${bookingRef}`, html });
  }

  async sendCancellationConfirmation(email: string, bookingRef: string, guestName: string) {
    const html = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf6f0; padding: 40px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4a3728; font-size: 28px; margin: 0;">The Vedara</h1>
          <p style="color: #8b7355; font-size: 14px;">A Himalayan Boutique Retreat</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #8b4513; margin-top: 0;">Booking Cancelled</h2>
          <p style="color: #4a3728;">Dear ${guestName},</p>
          <p style="color: #4a3728;">Your booking <strong>${bookingRef}</strong> has been cancelled as requested.</p>
          <p style="color: #8b7355;">If you have any questions, please contact us at +91-91188-82242.</p>
        </div>
      </div>
    `;
    await this.send({ to: email, subject: `Booking Cancelled — ${bookingRef}`, html });
  }

  async sendContactReply(email: string, subject: string, replyMessage: string) {
    const html = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf6f0; padding: 40px;">
        <h2 style="color: #2d5a3d;">The Vedara</h2>
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <p style="color: #4a3728;">${replyMessage}</p>
        </div>
      </div>
    `;
    await this.send({ to: email, subject: `Re: ${subject}`, html });
  }

  async sendCafeOrderConfirmation(email: string, orderRef: string, items: { name: string; quantity: number; price: number }[], total: number) {
    const itemsHtml = items.map(item => `
      <tr><td style="padding: 4px 0;">${item.name} x${item.quantity}</td><td style="text-align: right; padding: 4px 0;">₹${(item.price * item.quantity).toFixed(2)}</td></tr>
    `).join('');

    const html = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf6f0; padding: 40px;">
        <h2 style="color: #2d5a3d;">Order Confirmed — Café Charade</h2>
        <p style="color: #4a3728;">Order Ref: ${orderRef}</p>
        <table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>
        <p style="font-weight: bold; text-align: right; color: #2d5a3d; font-size: 16px;">Total: ₹${total.toFixed(2)}</p>
      </div>
    `;
    await this.send({ to: email, subject: `Order Confirmed — ${orderRef}`, html });
  }
}

export const emailService = new EmailService();
