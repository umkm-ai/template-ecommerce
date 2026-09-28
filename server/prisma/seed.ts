import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const minuman = await prisma.category.upsert({
    where: { name: "Minuman" },
    update: {},
    create: { name: "Minuman" },
  });
  const makanan = await prisma.category.upsert({
    where: { name: "Makanan" },
    update: {},
    create: { name: "Makanan" },
  });

  await prisma.product.upsert({
    where: { sku: "KOPI-001" },
    update: {},
    create: {
      slug: "kopi-susu",
      sku: "KOPI-001",
      name: "Kopi Susu",
      priceCents: 1800000,
      stock: 100,
      categoryId: minuman.id,
    },
  });
  await prisma.product.upsert({
    where: { sku: "ROTI-001" },
    update: {},
    create: {
      slug: "roti-bakar",
      sku: "ROTI-001",
      name: "Roti Bakar",
      priceCents: 1500000,
      stock: 50,
      categoryId: makanan.id,
    },
  });

  await prisma.customer.upsert({
    where: { email: "sari@example.com" },
    update: {},
    create: { name: "Bu Sari", email: "sari@example.com", phone: "6281234567890" },
  });

  console.log("seed complete");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
