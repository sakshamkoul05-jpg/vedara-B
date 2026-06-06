import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cottages = [
  {
    slug: 'monal-haven',
    name: 'Monal Haven',
    shortDesc: 'Luxury Duplex Suite with Private Jacuzzi',
    description: `Embrace Life Above the Canopy

Named after the vibrant Himalayan Monal, Monal Haven is a spectacular 552 sq. ft. duplex retreat where luxury meets nature. Floor-to-ceiling windows frame uninterrupted views of the surrounding peaks, while the handcrafted attic level opens onto a private balcony ideal for yoga, meditation, or simply watching the sunrise over the valley.

Unwind in your private Jacuzzi after a day of exploration, sip freshly brewed coffee from your cozy lounge corner, and enjoy restful nights wrapped in plush quilts behind premium blackout curtains.

Highlights

552 sq. ft. (51 sq. m.) Duplex Layout
Signature Wooden Attic
Private Love Seat & Coffee Table
Premium Blackout Curtains

Accommodation

Sleeps up to 4 Guests
2 King-Size Beds with Warm Quilts
Additional Blankets Available on Request
Paid Extra Bed Option Available

Luxury Features

Private Premium Jacuzzi
Attic Yoga & Meditation Balcony
Secondary Viewing Balcony
Complimentary Slippers & Luxury Toiletries

In-Room Refreshments

Electric Kettle
Complimentary Premium Tea & Coffee Selection

Amenities
Panoramic Mountain Views • Attached Modern Bathroom • High-Speed Internet • Complimentary Winter Room Heater • Room Service • Housekeeping • Chargeable Laundry Service`,
    pricePerNight: 12000,
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    size: 552,
    amenities: [
      '2 King-Size Beds',
      'Private Premium Jacuzzi',
      'Signature Wooden Attic',
      'Private Love Seat & Coffee Table',
      'Premium Blackout Curtains',
      'Attic Yoga & Meditation Balcony',
      'Secondary Viewing Balcony',
      'Electric Kettle',
      'Complimentary Premium Tea & Coffee Selection',
      'Complimentary Slippers & Luxury Toiletries',
      'Panoramic Mountain Views',
      'Attached Modern Bathroom',
      'High-Speed Internet',
      'Complimentary Winter Room Heater',
      'Room Service',
      'Housekeeping',
      'Chargeable Laundry Service',
    ],
    images: ['/images/cottages/monal-haven-1.jpg', '/images/cottages/monal-haven-2.jpg'],
    sortOrder: 1,
  },
  {
    slug: 'koklass-cove',
    name: 'Koklass Cove',
    shortDesc: 'Grand Duplex Suite with Private Jacuzzi',
    description: `Your Private Mountain Sanctuary

At 566 sq. ft., Koklass Cove is the largest cottage in our collection, offering unmatched space, privacy, and comfort. The expansive duplex layout, dramatic wooden attic, and twin balconies create an atmosphere of complete mountain seclusion.

Begin your day with yoga on the attic balcony as mist drifts through the pine forests below, then retreat to your private Jacuzzi for a deeply relaxing soak. Carefully designed blackout curtains, premium bedding, and warm alpine quilts ensure exceptional comfort throughout your stay.

Highlights

566 sq. ft. (52 sq. m.) Duplex Layout
Signature Wooden Attic
Love Seat Lounge Area
Premium Blackout Curtains

Accommodation

Sleeps up to 4 Guests
2 King-Size Beds with Warm Quilts
Additional Blankets Available on Request
Paid Extra Bed Option Available

Luxury Features

Private Premium Jacuzzi
Attic Yoga & Meditation Balcony
Secondary Viewing Balcony
Complimentary Slippers & Luxury Toiletries

In-Room Refreshments

Electric Kettle
Complimentary Premium Tea & Coffee Selection

Amenities
Sweeping Mountain Views • Attached Luxury Bathroom • High-Speed Internet • Complimentary Winter Room Heater • Room Service • Housekeeping • Chargeable Laundry Service`,
    pricePerNight: 12500,
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    size: 566,
    amenities: [
      '2 King-Size Beds',
      'Private Premium Jacuzzi',
      'Signature Wooden Attic',
      'Love Seat Lounge Area',
      'Premium Blackout Curtains',
      'Attic Yoga & Meditation Balcony',
      'Secondary Viewing Balcony',
      'Electric Kettle',
      'Complimentary Premium Tea & Coffee Selection',
      'Complimentary Slippers & Luxury Toiletries',
      'Sweeping Mountain Views',
      'Attached Luxury Bathroom',
      'High-Speed Internet',
      'Complimentary Winter Room Heater',
      'Room Service',
      'Housekeeping',
      'Chargeable Laundry Service',
    ],
    images: ['/images/cottages/koklass-cove-1.jpg', '/images/cottages/koklass-cove-2.jpg'],
    sortOrder: 2,
  },
  {
    slug: 'magpie-retreat',
    name: 'Magpie Retreat',
    shortDesc: 'Duplex Suite with Deep Soaking Bathtub',
    description: `Where Serenity Meets Soul

Inspired by the graceful Himalayan Magpie, this elegant 556 sq. ft. duplex offers a timeless mountain retreat centered around comfort and relaxation.

The highlight of the cottage is its luxurious deep-soak bathtub—perfect after a day spent exploring nearby trails and waterfalls. A charming attic space, dual balconies, and a dedicated meditation deck complete this peaceful alpine haven.

Highlights

556 sq. ft. (51 sq. m.) Duplex Layout
Cozy Wooden Attic
Love Seat & Coffee Table
Premium Blackout Curtains

Accommodation

Sleeps up to 4 Guests
2 King-Size Beds with Warm Quilts
Additional Blankets Available on Request
Paid Extra Bed Option Available

Luxury Features

Deep Soaking Bathtub
Attic Yoga & Meditation Balcony
Secondary Viewing Balcony
Complimentary Slippers & Luxury Toiletries

In-Room Refreshments

Electric Kettle
Complimentary Premium Tea & Coffee Selection

Amenities
Unobstructed Mountain Views • Attached Modern Bathroom • High-Speed Internet • Complimentary Winter Room Heater • Room Service • Housekeeping • Chargeable Laundry Service`,
    pricePerNight: 11000,
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    size: 556,
    amenities: [
      '2 King-Size Beds',
      'Deep Soaking Bathtub',
      'Cozy Wooden Attic',
      'Love Seat & Coffee Table',
      'Premium Blackout Curtains',
      'Attic Yoga & Meditation Balcony',
      'Secondary Viewing Balcony',
      'Electric Kettle',
      'Complimentary Premium Tea & Coffee Selection',
      'Complimentary Slippers & Luxury Toiletries',
      'Unobstructed Mountain Views',
      'Attached Modern Bathroom',
      'High-Speed Internet',
      'Complimentary Winter Room Heater',
      'Room Service',
      'Housekeeping',
      'Chargeable Laundry Service',
    ],
    images: ['/images/cottages/magpie-retreat-1.jpg', '/images/cottages/magpie-retreat-2.jpg'],
    sortOrder: 3,
  },
  {
    slug: 'whistling-thrush',
    name: 'Whistling Thrush',
    shortDesc: 'Intimate Mountain View Suite',
    description: `A Symphony of Himalayan Tranquility

This beautifully designed 270 sq. ft. suite offers a warm and inviting retreat overlooking the valley. Enjoy slow mornings on your private balcony, peaceful afternoons in the indoor lounge area, and deeply restful nights beneath premium quilts and blackout curtains.

Highlights

270 sq. ft. (25 sq. m.) Layout
Indoor Lounge Seating
Premium Blackout Curtains

Accommodation

Sleeps up to 2 Guests
1 King-Size Bed
Paid Extra Bed Option Available

Luxury Features

Private Balcony with Seating
Complimentary Slippers & Luxury Toiletries

Amenities
Mountain Views • Attached Modern Bathroom • High-Speed Internet • Complimentary Winter Room Heater • Room Service • Housekeeping • Chargeable Laundry Service`,
    pricePerNight: 7500,
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    size: 270,
    amenities: [
      '1 King-Size Bed',
      'Indoor Lounge Seating',
      'Premium Blackout Curtains',
      'Private Balcony with Seating',
      'Complimentary Slippers & Luxury Toiletries',
      'Mountain Views',
      'Attached Modern Bathroom',
      'High-Speed Internet',
      'Complimentary Winter Room Heater',
      'Room Service',
      'Housekeeping',
      'Chargeable Laundry Service',
    ],
    images: ['/images/cottages/whistling-thrush-1.jpg', '/images/cottages/whistling-thrush-2.jpg'],
    sortOrder: 4,
  },
  {
    slug: 'flycatcher-nook',
    name: 'Flycatcher Nook',
    shortDesc: 'Intimate Mountain View Suite',
    description: `Your Cozy Himalayan Hideaway

Flycatcher Nook is a warm and welcoming retreat designed for guests who appreciate life's quieter moments. Thoughtfully furnished with indoor lounge seating and a private mountain-view balcony, it offers the perfect balance of comfort, privacy, and boutique luxury.

Highlights

270 sq. ft. (25 sq. m.) Layout
Indoor Lounge Seating
Premium Blackout Curtains

Accommodation

Sleeps up to 2 Guests
1 King-Size Bed
Paid Extra Bed Option Available

Luxury Features

Private Balcony with Seating
Complimentary Slippers & Luxury Toiletries

Amenities
Sweeping Mountain Views • Attached Luxury Bathroom • High-Speed Internet • Complimentary Winter Room Heater • Room Service • Housekeeping • Chargeable Laundry Service`,
    pricePerNight: 7500,
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    size: 270,
    amenities: [
      '1 King-Size Bed',
      'Indoor Lounge Seating',
      'Premium Blackout Curtains',
      'Private Balcony with Seating',
      'Complimentary Slippers & Luxury Toiletries',
      'Sweeping Mountain Views',
      'Attached Luxury Bathroom',
      'High-Speed Internet',
      'Complimentary Winter Room Heater',
      'Room Service',
      'Housekeeping',
      'Chargeable Laundry Service',
    ],
    images: ['/images/cottages/flycatcher-nook-1.jpg', '/images/cottages/flycatcher-nook-2.jpg'],
    sortOrder: 5,
  },
  {
    slug: 'bulbul-nest',
    name: 'Bulbul Nest',
    shortDesc: 'Workcation Mountain View Suite',
    description: `Where Productivity Meets the Peaks

Crafted for modern travelers and remote professionals, Bulbul Nest combines the serenity of the mountains with practical work-friendly comforts. A dedicated workstation, high-speed internet, and inspiring valley views create an ideal workcation environment without compromising on relaxation.

Highlights

270 sq. ft. (25 sq. m.) Layout
Dedicated Workstation
Indoor Lounge Seating
Premium Blackout Curtains

Accommodation

Sleeps up to 2 Guests
1 King-Size Bed
Paid Extra Bed Option Available

Luxury Features

Private Balcony with Seating
Complimentary Slippers & Luxury Toiletries

Amenities
Mountain Views • Attached Modern Bathroom • High-Speed Internet • Complimentary Winter Room Heater • Room Service • Housekeeping • Chargeable Laundry Service`,
    pricePerNight: 7500,
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    size: 270,
    amenities: [
      '1 King-Size Bed',
      'Dedicated Workstation',
      'Indoor Lounge Seating',
      'Premium Blackout Curtains',
      'Private Balcony with Seating',
      'Complimentary Slippers & Luxury Toiletries',
      'Mountain Views',
      'Attached Modern Bathroom',
      'High-Speed Internet',
      'Complimentary Winter Room Heater',
      'Room Service',
      'Housekeeping',
      'Chargeable Laundry Service',
    ],
    images: ['/images/cottages/bulbul-nest-1.jpg', '/images/cottages/bulbul-nest-2.jpg'],
    sortOrder: 6,
  },
  {
    slug: 'the-finch-nook',
    name: 'Finch Nook',
    shortDesc: 'Cozy Alpine Studio',
    description: `Small Space, Endless Solitude

Thoughtfully designed within an efficient 120 sq. ft. footprint, Finch Nook captures the essence of a classic mountain cabin. Wrapped in warm wooden interiors, it offers everything needed for a peaceful and productive stay—from a dedicated study desk to a comfortable queen bed and modern conveniences.

Whether you're journaling beside the window, working remotely, or simply enjoying a hot cup of coffee after a mountain walk, Finch Nook provides a deeply personal retreat in the heart of the Himalayas.

Highlights

120 sq. ft. (11 sq. m.) Smart Layout
Premium Wooden Interiors
Dedicated Study Desk & Chair
Premium Blackout Curtains

Accommodation

Accommodates up to 2 Guests
1 Queen-Size Bed with Warm Alpine Quilts

In-Room Refreshments

Electric Kettle
Complimentary Premium Tea & Coffee Selection

Hospitality Features

Complimentary Slippers
Luxury Toiletries

Amenities
Attached Modern Bathroom • High-Speed Internet • Complimentary Winter Room Heater • Room Service • Housekeeping`,
    pricePerNight: 5000,
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    size: 120,
    amenities: [
      '1 Queen-Size Bed',
      'Premium Wooden Interiors',
      'Dedicated Study Desk & Chair',
      'Premium Blackout Curtains',
      'Electric Kettle',
      'Complimentary Premium Tea & Coffee Selection',
      'Complimentary Slippers',
      'Luxury Toiletries',
      'Attached Modern Bathroom',
      'High-Speed Internet',
      'Complimentary Winter Room Heater',
      'Room Service',
      'Housekeeping',
    ],
    images: ['/images/cottages/the-finch-nook-1.jpg', '/images/cottages/the-finch-nook-2.jpg'],
    sortOrder: 7,
  },
];

async function main() {
  console.log('Updating cottages...');
  for (const data of cottages) {
    const slug = data.slug;
    const existing = await prisma.cottage.findUnique({ where: { slug } });
    if (existing) {
      await prisma.cottage.update({
        where: { slug },
        data: {
          name: data.name,
          shortDesc: data.shortDesc,
          description: data.description,
          pricePerNight: data.pricePerNight,
          capacity: data.capacity,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          size: data.size,
          amenities: data.amenities,
          images: data.images,
          sortOrder: data.sortOrder,
        },
      });
      console.log(`  Updated: ${slug}`);
    } else {
      console.log(`  Not found (creating): ${slug}`);
      await prisma.cottage.create({
        data: {
          slug,
          ...data,
        },
      });
    }
  }
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
