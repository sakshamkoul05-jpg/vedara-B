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
- Check-in: 1 PM, Check-out: 11 AM
- Cancellation: Free 48hrs before, 50% within 48hrs
- Pets allowed on request
- All taxes included

Keep responses concise (2-3 sentences), warm, and helpful. If asked about booking, guide them to the booking page.
If you don't know something, say "Let me connect you with our team."
`;
  }

  async chat(message: string, history: { role: 'user' | 'assistant'; content: string }[] = []) {
    const systemContext = await this.getSystemContext();

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemContext },
          ...history.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user', content: message },
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