import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Vedara@2024', 12);

  await prisma.user.upsert({
    where: { email: 'vedararetreat@gmail.com' },
    update: {},
    create: {
      email: 'vedararetreat@gmail.com',
      password: adminPassword,
      name: 'Vedara Admin',
      role: 'SUPER_ADMIN',
      phone: '+91-9118882242',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@vedara.com' },
    update: {},
    create: {
      email: 'admin@vedara.com',
      password: await bcrypt.hash('admin123', 12),
      name: 'Vedara Admin (alt)',
      role: 'SUPER_ADMIN',
      phone: '+91-9118882242',
    },
  });

  await prisma.user.upsert({
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

  await prisma.user.upsert({
    where: { email: 'cafe@vedara.com' },
    update: {},
    create: {
      email: 'cafe@vedara.com',
      password: adminPassword,
      name: 'Cafe Staff',
      role: 'CAFE_STAFF',
      phone: '+91-8888888889',
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@vedara.com' },
    update: {},
    create: {
      email: 'staff@vedara.com',
      password: adminPassword,
      name: 'Service Staff',
      role: 'RECEPTIONIST',
      phone: '+91-8888888890',
    },
  });

  // Clear existing cottages and re-create with new data
  await prisma.blockedDate.deleteMany();
  await prisma.seasonalPricing.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.cottage.deleteMany();

  const cottages = [
    {
      name: 'Monal Haven',
      slug: 'monal-haven',
      category: 'Premium Duplex Family Suite',
      shortDesc: 'Luxury Duplex with Jacuzzi — embrace the canopy life',
      description: `Embrace the Canopy Life

Named after the radiant Himalayan Monal, this premium 552 sq. ft. duplex is a masterpiece of mountain luxury. Designed with an elegant wooden attic and massive glass windows, Monal Haven invites the raw beauty of the Ghiyagi peaks straight into your room.

Sip morning coffee on your private love seat, or step onto your attic balcony—thoughtfully designed to double as your private yoga and meditation deck. When night falls, draw the blackout curtains to seal in the warmth of your room, wrap yourself in our plush quilts, and enjoy an undisturbed, deeply restorative sleep.

Space & Comfort: 552 sq. ft. (51 sq. m.) Duplex Layout | Cozy Attic Space | Private Love Seat & Coffee Table | Blackout Curtains

The Luxury Touch: Private Premium Jacuzzi | Attic-Linked Yoga & Meditation Balcony | Second Sitting Balcony | Complimentary Slippers & Luxury Toiletries

Refreshments: In-room Electric Kettle with a selection of Premium Complimentary Tea & Coffee

Amenities: Panoramic Mountain Views, Attached Modern Bathroom, High-Speed Internet, Room Heater (complimentary during winter), Room Service, Housekeeping, Chargeable Laundry.`,
      pricePerNight: 12000,
      capacity: 4,
      bedrooms: 1,
      bathrooms: 1,
      size: 552,
      heaterCharge: 500,
      amenities: JSON.stringify([
        '2 King Size Beds', 'Private Jacuzzi', 'Attic Yoga & Meditation Balcony',
        'Second Sitting Balcony', 'Love Seat & Coffee Table', 'Blackout Curtains',
        'Electric Kettle with Tea & Coffee', 'Complimentary Slippers', 'Luxury Toiletries',
        'Attached Modern Bathroom', 'High-Speed Internet', 'Room Heater (Winter)',
        'Panoramic Mountain Views', 'Room Service', 'Housekeeping', 'Laundry (Chargeable)'
      ]),
      images: JSON.stringify(['/images/cottages/monal-haven-1.jpg', '/images/cottages/monal-haven-2.jpg']),
      sortOrder: 1,
    },
    {
      name: 'Koklass Cove',
      slug: 'koklass-cove',
      category: 'Premium Duplex Family Suite',
      shortDesc: 'Our Largest Duplex with Jacuzzi — your private mountain sanctuary',
      description: `Your Private Mountain Sanctuary

Spanning an expansive 566 sq. ft., Koklass Cove is our largest duplex cottage, offering unmatched privacy and spatial luxury. Perfect for families or friend groups who value room to breathe, this cottage features a dramatic attic framework and two viewing balconies.

Wake up early, brew a warm cup of coffee, and head up to the attic balcony—the perfect elevated sanctuary for morning yoga and meditation as the mountain mist rolls over the pine trees. At night, ensure ultimate privacy and deep rest by closing the premium blackout curtains, sliding into your indoor slippers, and tucking into heavy, mountain-grade quilts designed to keep the crisp Jibhi chill at bay.

Space & Comfort: 566 sq. ft. (52 sq. m.) Max-Space Duplex | Signature Wooden Attic | Intimate Love Seat Lounge | Blackout Curtains

The Luxury Touch: Private Premium Jacuzzi | Attic-Linked Yoga & Meditation Balcony | Second Sitting Balcony | Complimentary Slippers & Luxury Toiletries

Refreshments: In-room Electric Kettle with a selection of Premium Complimentary Tea & Coffee

Amenities: Sweeping Mountain Views, Attached Luxury Bathroom, High-Speed Internet, Room Heater (complimentary during winter), Room Service, Housekeeping, Chargeable Laundry.`,
      pricePerNight: 12500,
      capacity: 4,
      bedrooms: 1,
      bathrooms: 1,
      size: 566,
      heaterCharge: 500,
      amenities: JSON.stringify([
        '2 King Size Beds', 'Private Jacuzzi', 'Attic Yoga & Meditation Balcony',
        'Second Sitting Balcony', 'Love Seat Lounge', 'Blackout Curtains',
        'Electric Kettle with Tea & Coffee', 'Complimentary Slippers', 'Luxury Toiletries',
        'Attached Luxury Bathroom', 'High-Speed Internet', 'Room Heater (Winter)',
        'Sweeping Mountain Views', 'Room Service', 'Housekeeping', 'Laundry (Chargeable)'
      ]),
      images: JSON.stringify(['/images/cottages/koklass-cove-1.jpg', '/images/cottages/koklass-cove-2.jpg']),
      sortOrder: 2,
    },
    {
      name: 'Magpie Retreat',
      slug: 'magpie-retreat',
      category: 'Premium Duplex Family Suite',
      shortDesc: 'Charming Duplex with Bath Tub — where serenity meets soul',
      description: `Where Serenity Meets Soul

Inspired by the elegant calls of the Himalayan Magpie, this beautifully balanced 556 sq. ft. duplex offers a classic, deeply comforting mountain retreat. The crown jewel of this cottage is its deep, relaxing bath tub—ideal for a warm, soothing soak using our premium complimentary toiletries after exploring the local waterfall trails.

Featuring a gorgeous structural attic, a dual-balcony setup, and an attic balcony perfectly optimized for quiet yoga and meditation, Magpie Retreat captures the restorative magic of a boutique hideaway. Complete your nighttime routine by drawing the blackout curtains, sliding into warm room slippers, and melting into our premium quilts for a perfect night's rest.

Space & Comfort: 556 sq. ft. (51 sq. m.) Balanced Duplex Layout | Charming Attic Nook | Love Seat & Coffee Table Set | Blackout Curtains

The Luxury Touch: Deep-Soak Bath Tub | Attic-Linked Yoga & Meditation Balcony | Second Sitting Balcony | Complimentary Slippers & Luxury Toiletries

Refreshments: In-room Electric Kettle with a selection of Premium Complimentary Tea & Coffee

Amenities: Unobstructed Mountain Views, Attached Modern Bathroom, High-Speed Internet, Room Heater (complimentary during winter), Room Service, Housekeeping, Chargeable Laundry.`,
      pricePerNight: 11000,
      capacity: 4,
      bedrooms: 1,
      bathrooms: 1,
      size: 556,
      heaterCharge: 500,
      amenities: JSON.stringify([
        '2 King Size Beds', 'Deep-Soak Bath Tub', 'Attic Yoga & Meditation Balcony',
        'Second Sitting Balcony', 'Love Seat & Coffee Table', 'Blackout Curtains',
        'Electric Kettle with Tea & Coffee', 'Complimentary Slippers', 'Luxury Toiletries',
        'Attached Modern Bathroom', 'High-Speed Internet', 'Room Heater (Winter)',
        'Unobstructed Mountain Views', 'Room Service', 'Housekeeping', 'Laundry (Chargeable)'
      ]),
      images: JSON.stringify(['/images/cottages/magpie-retreat-1.jpg', '/images/cottages/magpie-retreat-2.jpg']),
      sortOrder: 3,
    },
    {
      name: 'Whistling Thrush',
      slug: 'whistling-thrush',
      category: 'Intimate Mountain View Suite',
      shortDesc: 'Intimate Mountain View Suite — a melody of mountain quietude',
      description: `A Melody of Mountain Quietude

Named after the iconic whistling bird of the Himalayas, this beautifully appointed 270 sq. ft. cottage is a retreat for couples and solo seekers. Whistling Thrush combines cozy mountain warmth with high-end comfort, featuring a plush king-size bed wrapped in heavy, mountain-grade quilts.

Wake up to unobstructed valley views, brew a fresh cup of tea, and sit out on your balcony using the two outdoor chairs and small table. Inside, a dedicated seating area with two single chairs and a coffee table provides the perfect nook to unwind. After dusk, pull the premium blackout curtains, and let the peaceful sounds of the Ghiyagi night lull you to sleep.

Space & Comfort: 270 sq. ft. (25 sq. m.) Intimate Layout | Indoor Seating (2 Single Chairs & Coffee Table) | Blackout Curtains

The Luxury Touch: Private Panoramic Balcony (2 Chairs & Small Table) | Complimentary Room Slippers & Luxury Toiletries

Refreshments: In-room Electric Kettle with a complimentary selection of Tea & Coffee sachets

Amenities: Stunning Mountain Views, Attached Modern Bathroom, High-Speed Internet, Room Heater (complimentary during winter), Room Service, Housekeeping (Laundry chargeable).`,
      pricePerNight: 7500,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 270,
      amenities: JSON.stringify([
        '1 King Size Bed', 'Private Panoramic Balcony',
        'Indoor Seating (2 Chairs & Table)', 'Blackout Curtains',
        'Electric Kettle with Tea & Coffee', 'Complimentary Slippers', 'Luxury Toiletries',
        'Attached Modern Bathroom', 'High-Speed Internet', 'Room Heater (Winter)',
        'Stunning Mountain Views', 'Room Service', 'Housekeeping', 'Laundry (Chargeable)'
      ]),
      images: JSON.stringify(['/images/cottages/whistling-thrush-1.jpg', '/images/cottages/whistling-thrush-2.jpg']),
      sortOrder: 4,
    },
    {
      name: 'Flycatcher Nook',
      slug: 'flycatcher-nook',
      category: 'Intimate Mountain View Suite',
      shortDesc: 'Intimate Mountain View Suite — your cozy Himalayan hideaway',
      description: `Your Cozy Himalayan Hideaway

Flycatcher Nook is a charming 270 sq. ft. escape designed specifically for those who appreciate the quieter moments of mountain life. The room is thoughtfully optimized to maximize comfort, offering a warm, wood-accented atmosphere featuring two single indoor chairs and a coffee table.

Spend your afternoons reading out on the balcony with its dedicated two-chair seating setup, or wrap yourself in our thick, warm quilts with a freshly brewed coffee in hand. It is an idyllic, self-contained haven for travelers looking to unplug without sacrificing modern boutique luxuries.

Space & Comfort: 270 sq. ft. (25 sq. m.) Intimate Layout | Indoor Seating (2 Single Chairs & Coffee Table) | Blackout Curtains

The Luxury Touch: Private Panoramic Balcony (2 Chairs & Small Table) | Complimentary Room Slippers & Luxury Toiletries

Refreshments: In-room Electric Kettle with a complimentary selection of Tea & Coffee sachets

Amenities: Sweeping Mountain Views, Attached Luxury Bathroom, High-Speed Internet, Room Heater (complimentary during winter), Room Service, Housekeeping (Laundry chargeable).`,
      pricePerNight: 7500,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 270,
      heaterCharge: 500,
      amenities: JSON.stringify([
        '1 King Size Bed', 'Private Panoramic Balcony',
        'Indoor Seating (2 Chairs & Table)', 'Blackout Curtains',
        'Electric Kettle with Tea & Coffee', 'Complimentary Slippers', 'Luxury Toiletries',
        'Attached Modern Bathroom', 'High-Speed Internet', 'Room Heater (Winter)',
        'Sweeping Mountain Views', 'Room Service', 'Housekeeping', 'Laundry (Chargeable)'
      ]),
      images: JSON.stringify(['/images/cottages/flycatcher-nook-1.jpg', '/images/cottages/flycatcher-nook-2.jpg']),
      sortOrder: 5,
    },
    {
      name: 'Bulbul Nest',
      slug: 'bulbul-nest',
      category: 'Intimate Mountain View Suite',
      shortDesc: 'Intimate Mountain View Suite with Workstation — where coziness meets the peaks',
      description: `Where Coziness Meets the Peaks

Perched to offer beautiful, unobstructed vistas of the surrounding wilderness, Bulbul Nest is a perfectly balanced 270 sq. ft. retreat curated for couples and remote professionals alike. This suite seamlessly features a dedicated workstation setup complete with a functional study table and chair, offering an inspiring remote work environment amidst the pines.

Slip into your complimentary room slippers, step onto the balcony to watch the mist clear over the mountains from your two outdoor chairs, or cocoon yourself inside under premium quilts next to your indoor coffee table and twin single chairs. With blackout curtains to ensure absolute morning privacy and high-speed internet to fuel your workflows, it represents the absolute pinnacle of luxury workcation setups.

Space & Comfort: 270 sq. ft. (25 sq. m.) Workcation Layout | Dedicated Workstation (Study Table & Chair) | Indoor Lounge Seating (2 Single Chairs & Coffee Table) | Blackout Curtains

The Luxury Touch: Private Panoramic Balcony (2 Chairs & Small Table) | Complimentary Room Slippers & Luxury Toiletries

Refreshments: In-room Electric Kettle with a complimentary selection of Tea & Coffee sachets

Amenities: Unobstructed Mountain Views, Attached Modern Bathroom, High-Speed Internet, Room Heater (complimentary during winter), Room Service, Housekeeping (Laundry chargeable).`,
      pricePerNight: 7500,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 270,
      heaterCharge: 500,
      amenities: JSON.stringify([
        '1 King Size Bed', 'Dedicated Workstation (Study Table & Chair)',
        'Private Panoramic Balcony', 'Indoor Lounge Seating (2 Chairs & Table)',
        'Blackout Curtains', 'Electric Kettle with Tea & Coffee',
        'Complimentary Slippers', 'Luxury Toiletries',
        'Attached Modern Bathroom', 'High-Speed Internet', 'Room Heater (Winter)',
        'Unobstructed Mountain Views', 'Room Service', 'Housekeeping', 'Laundry (Chargeable)'
      ]),
      images: JSON.stringify(['/images/cottages/bulbul-nest-1.jpg', '/images/cottages/bulbul-nest-2.jpg']),
      sortOrder: 6,
    },
    {
      name: 'The Finch Nook',
      slug: 'the-finch-nook',
      category: 'Cozy Alpine Studio',
      shortDesc: 'Cozy Alpine Studio — small space, boundless solitude',
      description: `Small Space, Boundless Solitude

Thoughtfully engineered for the solo adventurer, remote writer, or minimalist traveler, The Finch Nook is an intimate 120 sq. ft. alpine retreat. Enwrapped in floor-to-ceiling warm wooden paneling, this room captures the nostalgic essence of a classic mountain cabinette.

Whether you are using the dedicated study desk to pen your next journal entry, brewing a hot cup of coffee, or diving into the plush queen bed after a day of crisp mountain air, this room offers a highly functional, deeply comforting refuge where every square inch is designed with purpose.

Space & Comfort: 120 sq. ft. (11 sq. m.) Intelligent Minimalist Layout | Premium Wooden Paneling | Dedicated Study Desk & Chair | Blackout Curtains

Refreshments: In-room Electric Kettle with a selection of Premium Complimentary Tea & Coffee

The Hospitality Touch: Complimentary Room Slippers & Luxury Toiletries Included

Amenities: Attached Modern Bathroom, High-Speed Internet, Room Heater (complimentary during winter), Room Service, Housekeeping.`,
      pricePerNight: 5000,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 120,
      heaterCharge: 500,
      amenities: JSON.stringify([
        '1 Queen Size Bed', 'Dedicated Study Desk & Chair',
        'Premium Wooden Paneling', 'Blackout Curtains',
        'Electric Kettle with Tea & Coffee', 'Complimentary Slippers', 'Luxury Toiletries',
        'Attached Modern Bathroom', 'High-Speed Internet', 'Room Heater (Winter)',
        'Room Service', 'Housekeeping'
      ]),
      images: JSON.stringify(['/images/cottages/the-finch-nook-1.jpg', '/images/cottages/the-finch-nook-2.jpg']),
      sortOrder: 7,
    },
  ];

  for (const cottage of cottages) {
    await prisma.cottage.upsert({
      where: { slug: cottage.slug },
      update: {
        name: cottage.name,
        shortDesc: cottage.shortDesc,
        description: cottage.description,
        pricePerNight: cottage.pricePerNight,
        capacity: cottage.capacity,
        bedrooms: cottage.bedrooms,
        bathrooms: cottage.bathrooms,
        size: cottage.size,
        heaterCharge: cottage.heaterCharge,
        category: cottage.category,
        amenities: cottage.amenities,
        images: cottage.images,
        sortOrder: cottage.sortOrder,
      },
      create: cottage,
    });
  }

  // Cafe data
  await prisma.cafeOrderItem.deleteMany();
  await prisma.cafeOrder.deleteMany();
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

  // FAQs
  await prisma.fAQ.deleteMany();
  await prisma.fAQ.createMany({
    data: [
      { question: 'What is the check-in and check-out time?', answer: 'Check-in is at 1:00 PM and check-out is at 11:00 AM. Early check-in and late check-out can be arranged on request. Reception is open from 8:00 AM to 10:30 PM.', category: 'general', sortOrder: 1 },
      { question: 'Is breakfast included?', answer: 'A complimentary farm-style breakfast is served daily from 7:30 AM to 10:00 AM at Café Charade.', category: 'general', sortOrder: 2 },
      { question: 'Do you allow pets?', answer: 'Unfortunately, pets are not allowed at The Vedara.', category: 'policies', sortOrder: 3 },
      { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 15 days before check-in (90% refund). 50% refund for 8-15 days. No refund within 7 days. See our <a href="/policies#cancellation" class="text-forest-600 underline">full cancellation policy</a> for details.', category: 'policies', sortOrder: 4 },
      { question: 'Is there WiFi available?', answer: 'Yes, all cottages and common areas have complimentary high-speed WiFi.', category: 'amenities', sortOrder: 5 },
      { question: 'Do you have parking?', answer: 'Yes, we offer complimentary on-site parking for all guests.', category: 'amenities', sortOrder: 6 },
      { question: 'Are there activities nearby?', answer: 'We offer guided nature walks, stargazing sessions, bonfire evenings, and can arrange trekking, bird watching, and local village tours. See our <a href="/#experiences" class="text-forest-600 underline">experiences section</a>.', category: 'activities', sortOrder: 7 },
      { question: 'Is the cafe open to outside visitors?', answer: 'Absolutely! Café Charade is open to all. Breakfast: 7:30 AM – 10:00 AM, Lunch: 12:00 PM – 3:30 PM, Dinner: 7:00 PM – 10:00 PM. Non-guests are welcome.', category: 'cafe', sortOrder: 8 },
    ],
  });

  // Testimonials
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      { name: 'Ananya & Rohit Sharma', content: 'Monal Haven was everything we dreamed of and more. Waking up to mist over the mountains, the jacuzzi under the stars — pure magic. We\'ve already booked our next visit.', rating: 5, sortOrder: 1 },
      { name: 'Daniel Park', content: 'As a writer, I needed solitude and inspiration. Whistling Thrush gave me both. I wrote half my manuscript on the balcony. The staff was incredibly thoughtful.', rating: 5, sortOrder: 2 },
      { name: 'Emily & James Cooper', content: 'We celebrated our anniversary at Koklass Cove and it was perfection. The attic yoga balcony, the sweeping views — we felt like we were floating above the world.', rating: 5, sortOrder: 3 },
      { name: 'Priya Mehta', content: 'Magpie Retreat was perfect for our family getaway. The bath tub was divine, and we spent every evening watching the sunset from the balcony. The breakfast at Café Charade is to die for!', rating: 5, sortOrder: 4 },
    ],
  });

  console.log('Seed data created successfully!');
  console.log('Admin: admin@vedara.com / admin123');
  console.log('Manager: manager@vedara.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
