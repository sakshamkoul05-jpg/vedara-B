import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vedara Retreat API',
      version: '2.0.0',
      description: 'SaaS-level API for Vedara Retreat - Himalayan Boutique Resort Management Platform',
      contact: { name: 'Vedara Team', email: 'vedararetreat@gmail.com' },
      license: { name: 'MIT' },
    },
    servers: [
      { url: process.env.API_URL || 'http://localhost:5000/api', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Cottage: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            pricePerNight: { type: 'number' },
            capacity: { type: 'integer' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
            amenities: { type: 'array', items: { type: 'string' } },
            images: { type: 'array', items: { type: 'string' } },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bookingRef: { type: 'string' },
            guestId: { type: 'string' },
            cottageId: { type: 'string' },
            checkIn: { type: 'string', format: 'date-time' },
            checkOut: { type: 'string', format: 'date-time' },
            adults: { type: 'integer' },
            children: { type: 'integer' },
            totalAmount: { type: 'number' },
            finalAmount: { type: 'number' },
            status: { type: 'string', enum: ['PENDING', 'RESERVED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'EXPIRED'] },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string' },
            content: { type: 'string' },
            pros: { type: 'string' },
            cons: { type: 'string' },
          },
        },
        Webhook: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            url: { type: 'string', format: 'uri' },
            events: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Bookings', description: 'Cottage booking management' },
      { name: 'Cottages', description: 'Cottage listings' },
      { name: 'Cafe', description: 'Cafe menu & orders' },
      { name: 'CMS', description: 'Content management' },
      { name: 'Properties', description: 'Multi-property management' },
      { name: 'Guests', description: 'Guest CRM & loyalty' },
      { name: 'Pricing', description: 'Dynamic pricing rules' },
      { name: 'Staff', description: 'Staff scheduling & attendance' },
      { name: 'Inventory', description: 'Cafe inventory management' },
      { name: 'Reviews', description: 'Guest reviews & feedback' },
      { name: 'Webhooks', description: 'Webhook system' },
      { name: 'Documents', description: 'Document management' },
      { name: 'Notifications', description: 'Notification system' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Vedara Retreat API Docs',
  }));
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}
