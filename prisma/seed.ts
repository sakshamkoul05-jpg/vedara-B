import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vedara.com' },
    update: {},
    create: {
      email: 'admin@vedara.com',
      password: adminPassword,
      name: 'Vedara Admin',
      role: 'SUPER_ADMIN',
      phone: '+91-9118882242',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@vedara.com' },
    update: {},
    create: {
      email: 'manager@vedara.com',
      password: adminPassword,
      name: 'Hotel Manager',
      role: 'MANAGER',
      phone: '+91-8888888888',
    },
  });

  const cottages = [
    {
      name: 'The Pine Perch',
      slug: 'pine-perch',
      description: 'Perched among towering pines, this cottage offers panoramic mountain views from its private deck. Wake up to the scent of cedar and the sound of birdsong. Features a handcrafted wooden bed, stone fireplace, and an outdoor soaking tub under the stars.',
      shortDesc: 'A secluded pine-wood haven with mountain views',
      pricePerNight: 8500,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 450,
      amenities: JSON.stringify(['King Bed', 'Fireplace', 'Private Deck', 'Outdoor Tub', 'WiFi', 'Mini Bar', 'Mountain View']),
      images: JSON.stringify(['/images/cottages/pine-perch-1.jpg', '/images/cottages/pine-perch-2.jpg']),
      sortOrder: 1,
    },
    {
      name: 'The Cedar Nook',
      slug: 'cedar-nook',
      description: 'Tucked away in a grove of ancient cedars, this intimate cottage is perfect for a romantic escape. The interiors blend rustic wood with soft linens, and the private garden features a hammock and fire pit.',
      shortDesc: 'Intimate cedar retreat with a private garden',
      pricePerNight: 7500,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 380,
      amenities: JSON.stringify(['Queen Bed', 'Garden', 'Fire Pit', 'Hammock', 'WiFi', 'Tea Kettle']),
      images: JSON.stringify(['/images/cottages/cedar-nook-1.jpg', '/images/cottages/cedar-nook-2.jpg']),
      sortOrder: 2,
    },
    {
      name: 'The Maple Suite',
      slug: 'maple-suite',
      description: 'Our largest cottage, the Maple Suite, features two bedrooms, a living room with a grand fireplace, and a wraparound veranda. Surrounded by maples that turn crimson in autumn, it is ideal for families or small groups.',
      shortDesc: 'Spacious family cottage with wraparound veranda',
      pricePerNight: 14000,
      capacity: 4,
      bedrooms: 2,
      bathrooms: 2,
      size: 750,
      amenities: JSON.stringify(['2 Queen Beds', 'Living Room', 'Fireplace', 'Veranda', 'WiFi', 'Kitchenette', 'Mountain View']),
      images: JSON.stringify(['/images/cottages/maple-suite-1.jpg', '/images/cottages/maple-suite-2.jpg']),
      sortOrder: 3,
    },
    {
      name: 'The Fern Hollow',
      slug: 'fern-hollow',
      description: 'Nestled in a lush hollow dotted with ferns and wildflowers, this cottage feels like a storybook hideaway. A cozy loft bedroom, stained-glass windows, and a stream-side seating area make it truly magical.',
      shortDesc: 'Storybook hideaway in a fern-filled hollow',
      pricePerNight: 6500,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 320,
      amenities: JSON.stringify(['Loft Bed', 'Stained Glass', 'Stream View', 'WiFi', 'Patio']),
      images: JSON.stringify(['/images/cottages/fern-hollow-1.jpg', '/images/cottages/fern-hollow-2.jpg']),
      sortOrder: 4,
    },
    {
      name: 'The Ridge View',
      slug: 'ridge-view',
      description: 'Perched on the highest point of the property, Ridge View offers uninterrupted panoramas of the valley and distant peaks. A glass-walled living area brings the outdoors in, while the private infinity tub is pure bliss.',
      shortDesc: 'Panoramic ridge-top luxury with infinity tub',
      pricePerNight: 11000,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 500,
      amenities: JSON.stringify(['King Bed', 'Glass Living', 'Infinity Tub', 'Deck', 'WiFi', 'Bar', 'Valley View']),
      images: JSON.stringify(['/images/cottages/ridge-view-1.jpg', '/images/cottages/ridge-view-2.jpg']),
      sortOrder: 5,
    },
    {
      name: 'The Willow Cabin',
      slug: 'willow-cabin',
      description: 'Set beside a gentle stream under the shade of weeping willows, this cabin exudes tranquility. The sound of water, the soft glow of lanterns, and the hammock strung between trees create an atmosphere of pure peace.',
      shortDesc: 'Streamside cabin with willow-shaded hammock',
      pricePerNight: 7000,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 350,
      amenities: JSON.stringify(['Queen Bed', 'Streamside', 'Hammock', 'Lanterns', 'WiFi', 'Outdoor Shower']),
      images: JSON.stringify(['/images/cottages/willow-cabin-1.jpg', '/images/cottages/willow-cabin-2.jpg']),
      sortOrder: 6,
    },
    {
      name: 'The Summit Room',
      slug: 'summit-room',
      description: 'Our premium room within the main lodge, the Summit Room blends Victorian elegance with mountain charm. High ceilings, a four-poster bed, and a bay window seat with telescope for stargazing.',
      shortDesc: 'Premium lodge room with Victorian charm',
      pricePerNight: 5500,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 280,
      amenities: JSON.stringify(['Four-Poster Bed', 'Bay Window', 'Telescope', 'WiFi', 'Lodge Access', 'Breakfast']),
      images: JSON.stringify(['/images/cottages/summit-room-1.jpg', '/images/cottages/summit-room-2.jpg']),
      sortOrder: 7,
    },
  ];

  for (const cottage of cottages) {
    await prisma.cottage.upsert({
      where: { slug: cottage.slug },
      update: {},
      create: cottage,
    });
  }

  const cafeCategories = [
    {
      name: 'Artisan Coffee',
      slug: 'artisan-coffee',
      description: 'Hand-poured brews from mountain-grown beans',
      sortOrder: 1,
      items: [
        { name: 'Forest Pour-Over', description: 'Single-origin, light roast with floral notes', price: 350, isVegetarian: true },
        { name: 'Maple Latte', description: 'Espresso with steamed milk and local maple syrup', price: 420, isVegetarian: true },
        { name: 'Cold Brew Tonic', description: 'Slow-steeped cold brew with soda and lemon', price: 380, isVegetarian: true },
        { name: 'Cinnamon Cappuccino', description: 'Classic cappuccino dusted with cinnamon', price: 390, isVegetarian: true },
      ],
    },
    {
      name: 'Mountain Breakfast',
      slug: 'mountain-breakfast',
      description: 'Hearty farm-to-table breakfasts',
      sortOrder: 2,
      items: [
        { name: 'Forest Granola Bowl', description: 'Toasted oats, berries, honey, yogurt', price: 450, isVegetarian: true },
        { name: 'Smoked Trout Plate', description: 'Locally smoked trout, poached eggs, sourdough', price: 650, isVegetarian: false },
        { name: 'Wild Mushroom Omelette', description: 'Foraged mushrooms, aged cheese, herbs', price: 520, isVegetarian: true },
        { name: 'Pancake Stack', description: 'Fluffy buttermilk, maple butter, fresh fruit', price: 480, isVegetarian: true },
      ],
    },
    {
      name: 'Wood-Fired Eats',
      slug: 'wood-fired-eats',
      description: 'Fire-cooked meals from our stone hearth',
      sortOrder: 3,
      items: [
        { name: 'Truffle Mushroom Pizza', description: 'Wild mushrooms, truffle oil, mozzarella', price: 680, isVegetarian: true },
        { name: 'Herb-Crusted Lamb', description: 'Slow-roasted with mountain herbs, root veggies', price: 890, isVegetarian: false },
        { name: 'Smoked Vegetable Stew', description: 'Seasonal vegetables in a rich smoked broth', price: 550, isVegetarian: true },
        { name: 'Grilled River Trout', description: 'Fresh catch with lemon butter and herbs', price: 750, isVegetarian: false },
      ],
    },
    {
      name: 'Cottage Bakes',
      slug: 'cottage-bakes',
      description: 'Fresh from the oven, rustic and heartwarming',
      sortOrder: 4,
      items: [
        { name: 'Sourdough Loaf', description: 'Slow-fermented, crusty country bread', price: 280, isVegetarian: true },
        { name: 'Berry Crumble', description: 'Warm forest berries with oat crumble, cream', price: 390, isVegetarian: true },
        { name: 'Honey Cake Slice', description: 'Local honey, almonds, whipped cream', price: 350, isVegetarian: true },
        { name: 'Mud Pie', description: 'Dark chocolate, espresso, cookie crust', price: 420, isVegetarian: true },
      ],
    },
    {
      name: 'Evening Sips',
      slug: 'evening-sips',
      description: 'Cocktails, spirits, and warmers by the fire',
      sortOrder: 5,
      items: [
        { name: 'Smoked Old Fashioned', description: 'Bourbon, smoked maple, bitters', price: 550, isVegetarian: true },
        { name: 'Mountain Mule', description: 'Vodka, ginger, lime, mint', price: 480, isVegetarian: true },
        { name: 'Hot Toddy', description: 'Whiskey, honey, lemon, cloves', price: 420, isVegetarian: true },
        { name: 'Spiced Apple Cider', description: 'Warm cider with cinnamon and star anise', price: 350, isVegetarian: true },
      ],
    },
  ];

  for (const category of cafeCategories) {
    const created = await prisma.cafeCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: { name: category.name, slug: category.slug, description: category.description, sortOrder: category.sortOrder },
    });

    for (const item of category.items) {
      await prisma.cafeItem.upsert({
        where: { id: `${created.id}-${item.name.toLowerCase().replace(/\s+/g, '-')}` },
        update: {},
        create: {
          id: `${created.id}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
          categoryId: created.id,
          name: item.name,
          description: item.description,
          price: item.price,
          isVegetarian: item.isVegetarian,
          sortOrder: category.items.indexOf(item),
        },
      });
    }
  }

  await prisma.fAQ.deleteMany();
  await prisma.fAQ.createMany({
    data: [
      { question: 'What is the check-in and check-out time?', answer: 'Check-in is at 2:00 PM and check-out is at 11:00 AM. Early check-in and late check-out can be arranged on request.', category: 'general', sortOrder: 1 },
      { question: 'Is breakfast included?', answer: 'A complimentary farm-style breakfast is served daily from 7:30 AM to 10:00 AM at our cafe.', category: 'general', sortOrder: 2 },
      { question: 'Do you allow pets?', answer: 'Yes! We welcome well-behaved pets in select cottages (The Cedar Nook and Willow Cabin). Please inform us at the time of booking.', category: 'policies', sortOrder: 3 },
      { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 48 hours before check-in. 50% charge within 48 hours. No-shows are charged the full amount.', category: 'policies', sortOrder: 4 },
      { question: 'Is there WiFi available?', answer: 'Yes, all cottages and common areas have complimentary high-speed WiFi.', category: 'amenities', sortOrder: 5 },
      { question: 'Do you have parking?', answer: 'Yes, we offer complimentary on-site parking for all guests.', category: 'amenities', sortOrder: 6 },
      { question: 'Are there activities nearby?', answer: 'We offer guided nature walks, stargazing sessions, bonfire evenings, and can arrange trekking, bird watching, and local village tours.', category: 'activities', sortOrder: 7 },
      { question: 'Is the cafe open to outside visitors?', answer: 'Absolutely! Our cafe is open to all from 7:00 AM to 9:00 PM. Non-guests are welcome to enjoy our food and ambiance.', category: 'cafe', sortOrder: 8 },
    ],
  });

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      { name: 'Ananya & Rohit Sharma', content: 'The Pine Perch was everything we dreamed of and more. Waking up to the mist over the mountains, the warm fireplace at night — it was pure magic. We have already booked our next visit.', rating: 5, sortOrder: 1 },
      { name: 'Daniel Park', content: 'As a writer, I needed solitude and inspiration. The Fern Hollow gave me both. I wrote half my manuscript sitting by the stream. The staff was incredibly thoughtful.', rating: 5, sortOrder: 2 },
      { name: 'Emily & James Cooper', content: 'We celebrated our anniversary at the Ridge View and it was perfection. The infinity tub under the stars, the glass-walled living room — we felt like we were floating above the world.', rating: 5, sortOrder: 3 },
      { name: 'Priya Mehta', content: 'The Maple Suite was perfect for our family reunion. The kids loved the veranda, and we spent every evening by the grand fireplace. The breakfast at the cafe is to die for!', rating: 5, sortOrder: 4 },
    ],
  });

  console.log('Seed data created successfully!');
  console.log(`Admin: admin@vedara.com / admin123`);
  console.log(`Manager: manager@vedara.com / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
