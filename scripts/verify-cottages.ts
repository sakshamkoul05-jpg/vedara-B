import { PrismaClient } from '@prisma/client';
async function main() {
const p = new PrismaClient();
const c = await p.cottage.findMany({ orderBy: { sortOrder: 'asc' } });
for (const x of c) {
  console.log(`${x.slug} | ${x.shortDesc} | ${x.pricePerNight} | ${x.capacity}pax | ${x.bedrooms}BR | ${x.bathrooms}BA | ${x.size}sqft | amenities: ${x.amenities.length} | desc: ${x.description.slice(0,60)}...`);
}
await p.$disconnect();
}
main();
