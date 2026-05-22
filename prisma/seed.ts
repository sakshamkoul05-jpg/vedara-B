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

  await prisma.cafeItem.deleteMany();
  await prisma.cafeCategory.deleteMany();

  const cafeCategories = [
    {
      name: 'Mountain Breakfast',
      slug: 'mountain-breakfast',
      description: 'Hearty farm-to-table breakfasts to start your day',
      sortOrder: 1,
      items: [
        { name: 'Himalayan Hearth Paratha Platter', price: 280, isVegetarian: true },
        { name: 'Sunrise Farmhouse Breakfast', price: 280, isVegetarian: true },
        { name: 'Cinnamon Cloud Toast', price: 280, isVegetarian: true },
        { name: 'Maple Mountain Pancakes', price: 280, isVegetarian: true },
        { name: 'Alpine Breakfast Melt', price: 280, isVegetarian: true },
        { name: 'Himalayan Harvest Bowl', price: 280, isVegetarian: true },
        { name: 'The Charade Grand Breakfast', price: 280, isVegetarian: true },
        { name: 'Pahadi Morning Puri Platter', price: 280, isVegetarian: true },
        { name: 'Fresh Fruit Bowl', price: 80, isVegetarian: true },
        { name: 'Extra Toast', price: 30, isVegetarian: true },
        { name: 'Roasted Potatoes', price: 50, isVegetarian: true },
      ],
    },
    {
      name: 'Himachali Specials',
      slug: 'himachali-specials',
      description: 'Traditional mountain flavours from Himachal kitchens',
      sortOrder: 2,
      items: [
        { name: 'Royal Himachali Dham Experience', price: 560, isVegetarian: true },
        { name: 'Himachali Sepu Vadi', price: 180, isVegetarian: true },
        { name: 'Traditional Siddu with Himalayan Ghee', price: 200, isVegetarian: true },
      ],
    },
    {
      name: 'Vedara Thali',
      slug: 'vedara-thali',
      description: 'Complete mountain meals served thali-style',
      sortOrder: 3,
      items: [
        { name: 'Vedara Mountain Thali Veg', price: 350, isVegetarian: true },
        { name: 'Vedara Mountain Thali Non-Veg', price: 420, isVegetarian: false },
      ],
    },
    {
      name: 'Mountain Curries',
      slug: 'mountain-curries',
      description: 'Slow-cooked curries with mountain spices',
      sortOrder: 4,
      items: [
        { name: 'Himalayan Spiced Mountain Rice', price: 320, isVegetarian: true },
        { name: 'Pahadi Mutton Curry', price: 720, isVegetarian: false },
        { name: 'Himalayan Lemon Butter Trout', price: 850, isVegetarian: false },
        { name: 'Smoked Yellow Dal Tadka', price: 180, isVegetarian: true },
        { name: 'Slow Simmered Dal Makhani', price: 220, isVegetarian: true },
        { name: 'Mountain Rajma', price: 200, isVegetarian: true },
        { name: 'Paneer Bhurji', price: 220, isVegetarian: true },
        { name: 'Matar Paneer (Dry / Gravy)', price: 240, isVegetarian: true },
        { name: 'Mushroom Matar', price: 220, isVegetarian: true },
        { name: 'Cottage Cheese Kadhai Masala', price: 260, isVegetarian: true },
        { name: 'Jeera Aloo / Chatpate Aloo / Methi Aloo', price: 180, isVegetarian: true },
        { name: 'Seasonal Mixed Vegetable', price: 140, isVegetarian: true },
        { name: 'Egg Bhurji', price: 160, isVegetarian: false },
        { name: 'Egg Curry', price: 180, isVegetarian: false },
        { name: 'Kadhai Murg', price: 280, isVegetarian: false },
        { name: 'Rustic Chicken Rahra', price: 320, isVegetarian: false },
        { name: 'Mutton Rogan Josh (Pre-Order)', price: 620, isVegetarian: false },
      ],
    },
    {
      name: 'Wood-Fired & Grills',
      slug: 'wood-fired-grills',
      description: 'Fire-cooked meats and paneer from our kitchen hearth',
      sortOrder: 5,
      items: [
        { name: 'Rosemary Herb Roasted Chicken', price: 420, isVegetarian: false },
        { name: 'Herb Roasted Paneer', price: 360, isVegetarian: true },
      ],
    },
    {
      name: 'Alpine Pasta',
      slug: 'alpine-pasta',
      description: 'Mountain-style pasta bowls',
      sortOrder: 6,
      items: [
        { name: 'Creamy Alpine Pasta Veg', price: 300, isVegetarian: true },
        { name: 'Creamy Alpine Pasta Chicken', price: 340, isVegetarian: false },
        { name: 'Rustic Tomato Basil Pasta Veg', price: 300, isVegetarian: true },
        { name: 'Rustic Tomato Basil Pasta Chicken', price: 340, isVegetarian: false },
        { name: 'Light Ramen Bowl Veg', price: 260, isVegetarian: true },
        { name: 'Light Ramen Bowl Non-Veg', price: 290, isVegetarian: false },
      ],
    },
    {
      name: 'Asian Wok',
      slug: 'asian-wok',
      description: 'Wok-tossed Asian flavours in the mountains',
      sortOrder: 7,
      items: [
        { name: 'Himalayan Hot & Sour Soup', price: 140, isVegetarian: true },
        { name: 'Manchow Soup with Crispy Noodles', price: 140, isVegetarian: true },
        { name: 'Wok Tossed Chilli Paneer', price: 220, isVegetarian: true },
        { name: 'Chilli Mushroom', price: 200, isVegetarian: true },
        { name: 'Mountain Fire Chilli Chicken', price: 260, isVegetarian: false },
        { name: 'Crispy Honey Chilli Potato', price: 180, isVegetarian: true },
        { name: 'Vedara Special Stir Fry Veg', price: 240, isVegetarian: true },
        { name: 'Vedara Special Stir Fry Non-Veg', price: 240, isVegetarian: false },
        { name: 'Veg Manchurian (Dry)', price: 180, isVegetarian: true },
        { name: 'Veg Manchurian (Gravy)', price: 220, isVegetarian: true },
        { name: 'Hakka Noodles Veg', price: 240, isVegetarian: true },
        { name: 'Hakka Noodles Non-Veg', price: 270, isVegetarian: false },
        { name: 'Burnt Garlic Noodles Veg', price: 250, isVegetarian: true },
        { name: 'Burnt Garlic Noodles Non-Veg', price: 280, isVegetarian: false },
        { name: 'Veg Fried Rice', price: 240, isVegetarian: true },
        { name: 'Chicken Fried Rice', price: 270, isVegetarian: false },
        { name: 'Thai Red Curry with Rice Veg', price: 300, isVegetarian: true },
        { name: 'Thai Red Curry with Rice Non-Veg', price: 330, isVegetarian: false },
        { name: 'Thai Green Curry with Rice Veg', price: 300, isVegetarian: true },
        { name: 'Thai Green Curry with Rice Non-Veg', price: 330, isVegetarian: false },
      ],
    },
    {
      name: 'Soups & Starters',
      slug: 'soups-starters',
      description: 'Mountain snacks and warm bowls to begin your meal',
      sortOrder: 8,
      items: [
        { name: 'Himalayan Masala Maggi Veg', price: 150, isVegetarian: true },
        { name: 'Himalayan Masala Maggi Egg', price: 170, isVegetarian: false },
        { name: 'Himalayan Masala Maggi Chicken', price: 200, isVegetarian: false },
        { name: 'Crispy Buttered Corn', price: 160, isVegetarian: true },
        { name: 'Monsoon Pakoda Basket', price: 180, isVegetarian: true },
        { name: 'Mountain Loaded Nachos', price: 280, isVegetarian: true },
        { name: 'Chicken Popcorn', price: 240, isVegetarian: false },
        { name: 'Smoky Tawa Paneer Bites', price: 260, isVegetarian: true },
        { name: 'French Fries', price: 180, isVegetarian: true },
        { name: 'Peanut Masala', price: 230, isVegetarian: true },
        { name: 'Cheese Potato Balls', price: 200, isVegetarian: true },
      ],
    },
    {
      name: 'Salads & Sides',
      slug: 'salads-sides',
      description: 'Light and fresh mountain sides',
      sortOrder: 9,
      items: [
        { name: 'Green Salad', price: 120, isVegetarian: true },
      ],
    },
    {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Sweet endings to your mountain meal',
      sortOrder: 10,
      items: [
        { name: 'Gulab Jamun (2 pcs)', price: 90, isVegetarian: true },
        { name: 'Suji / Carrot Halwa (Seasonal)', price: 90, isVegetarian: true },
        { name: 'Sweet Saffron Rice Kheer', price: 100, isVegetarian: true },
        { name: 'Choice of Ice-Cream', price: 110, isVegetarian: true },
      ],
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      description: 'Handcrafted hot and cold drinks',
      sortOrder: 11,
      items: [
        { name: 'Himalayan Immunity Brew', price: 130, isVegetarian: true },
        { name: 'Wild Rose Mountain Tea', price: 140, isVegetarian: true },
        { name: 'Masala / Cardamom / Ginger Tea', price: 130, isVegetarian: true },
        { name: 'Black Tea / Tulsi Herbal Tea', price: 110, isVegetarian: true },
        { name: 'Sunrise Saffron Milk', price: 140, isVegetarian: true },
        { name: 'Hot Coffee (Milk / Black)', price: 160, isVegetarian: true },
        { name: 'Filter Coffee', price: 140, isVegetarian: true },
        { name: 'Velvety Hot Chocolate', price: 170, isVegetarian: true },
        { name: 'Himalayan Cold Coffee Blend', price: 180, isVegetarian: true },
        { name: 'Fresh Seasonal Juice', price: 160, isVegetarian: true },
        { name: 'Banana Shake', price: 180, isVegetarian: true },
        { name: 'Lassi (Sweet / Salted)', price: 110, isVegetarian: true },
        { name: 'Fresh Lime Soda (Sweet / Salted)', price: 130, isVegetarian: true },
        { name: 'Mojito (Classic / Mint / Lemon)', price: 170, isVegetarian: true },
        { name: 'Bournvita', price: 80, isVegetarian: true },
        { name: 'Hot Milk', price: 70, isVegetarian: true },
        { name: 'Pink Flamingo Milk', price: 90, isVegetarian: true },
        { name: 'Seasonal Milkshakes', price: 120, isVegetarian: true },
        { name: 'Mini Hot Chocolate with Marshmallow', price: 120, isVegetarian: true },
        { name: 'Chocos / Cornflakes with Hot / Cold Milk', price: 90, isVegetarian: true },
        { name: 'Honey', price: 40, isVegetarian: true },
        { name: 'Almond Milk', price: 50, isVegetarian: true },
        { name: 'Extra Espresso Shot', price: 60, isVegetarian: true },
        { name: 'Hazelnut', price: 50, isVegetarian: true },
      ],
    },
  ];

  for (const category of cafeCategories) {
    const created = await prisma.cafeCategory.create({
      data: { name: category.name, slug: category.slug, description: category.description, sortOrder: category.sortOrder },
    });

    for (const item of category.items) {
      await prisma.cafeItem.create({
        data: {
          categoryId: created.id,
          name: item.name,
          description: item.name,
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
      { question: 'What is the check-in and check-out time?', answer: 'Check-in is at 1:00 PM and check-out is at 11:00 AM. Early check-in and late check-out can be arranged on request.', category: 'general', sortOrder: 1 },
      { question: 'Is breakfast included?', answer: 'A complimentary farm-style breakfast is served daily from 7:30 AM to 10:00 AM at our cafe.', category: 'general', sortOrder: 2 },
      { question: 'Do you allow pets?', answer: 'Unfortunately, pets are not allowed at Vedara Retreat.', category: 'policies', sortOrder: 3 },
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
