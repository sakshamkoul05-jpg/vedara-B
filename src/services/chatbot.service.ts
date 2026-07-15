import Groq from 'groq-sdk';
import { config } from '../config';
import prisma from '../config/database';

class ChatbotService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({ apiKey: config.groq.apiKey });
  }

  private async getSystemContext(): Promise<string> {
    const cottages = await prisma.cottage.findMany({ where: { isActive: true }, take: 10 });
    const cafeCategories = await prisma.cafeCategory.findMany({
      where: { isActive: true },
      include: { items: { where: { isAvailable: true }, take: 5 } },
      take: 5,
    });
    const faqs = await prisma.fAQ.findMany({ where: { isActive: true }, take: 10 });
    const settings = await prisma.siteSetting.findMany();
    const siteInfo = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as any);

    return `
You are a friendly, warm concierge for Vedara Retreat Hotels, a cozy mountain retreat.
Speak like a warm mountain host — poetic, calm, and helpful.

ABOUT VEDARA:
Nestled in the mountains with 6 luxury cottages and 1 premium room.
Vintage aesthetic, slow-living philosophy.
Contact: ${siteInfo.contactEmail || 'vedararetreat@gmail.com'}, ${siteInfo.contactPhone || '+91-9118882242'}

COTTAGES:
${cottages.map(c => `- ${c.name}: ₹${c.pricePerNight}/night, ${c.capacity} guests, ${c.bedrooms}BR. ${c.shortDesc || c.description.slice(0, 100)}`).join('\n')}

CAFE MENU:
${cafeCategories.map(cat => `${cat.name}: ${cat.items.map(i => i.name).join(', ')}`).join('\n')}

FAQs:
${faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}

POLICIES:
- Check-in: 1:00 PM, Check-out: 11:00 AM
- Reception Hours: 8:00 AM – 10:30 PM daily
- Cancellation: Free 15+ days before (90% refund), 8-15 days (50% refund), less than 7 days (no refund)
- Peak season: 21+ days for 50% refund, less than 21 days (no refund)
- Pets not allowed
- All prices are exclusive of applicable taxes (12% GST added at checkout)
- Quiet hours: 11:00 PM to 7:00 AM
- ID proof required at check-in (Aadhaar/Passport/DL for Indians, Passport for foreigners)

NEARBY ATTRACTIONS:
- Mini Thailand: 1.2 km — A unique rock formation resembling Thailand's beaches
- Jibhi Waterfall: 4 km — Cascading waterfall hidden in the forest
- Jalori Pass: 10 km — High-altitude pass with sweeping mountain views
- Serolsar Lake: 10 km + short trek — Crystal-clear lake surrounded by ancient oak trees

Keep responses concise (2-3 sentences), warm, and helpful. If asked about booking, guide them to the booking page.
If you don't know something, say "Let me connect you with our team."
`;
  }

  async chat(message: string, history: { role: 'user' | 'assistant' | string; content: string }[] = []) {
    const systemContext = await this.getSystemContext();

    const sanitizedHistory = (history || [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-10)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const safeMessage = typeof message === 'string' ? message.slice(0, 2000) : '';
    if (!safeMessage.trim()) {
      return 'Please let me know how I can help you.';
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemContext },
          ...sanitizedHistory,
          { role: 'user', content: safeMessage },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'I apologize, I could not process that. Please try again.';
    } catch (error: any) {
      console.error('[Chatbot] Groq error:', error?.message || error?.status || error);
      return 'I apologize, I am having trouble connecting. Please try again or contact our team directly.';
    }
  }
}

export const chatbotService = new ChatbotService();