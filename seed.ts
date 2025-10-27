import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.$transaction([
    prisma.contact.deleteMany(),
    prisma.address.deleteMany(),
    prisma.product.deleteMany(),
    prisma.supplier.deleteMany(),
  ]);

  const getProduct = (supplierId: string) => {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      category: faker.commerce.department(),
      price: Number.parseFloat(faker.commerce.price()),
      stock: faker.number.int({ min: 0, max: 500 }),
      description: faker.commerce.productDescription(),
      createdAt: faker.date.past(),
      metadata: {
        tags: [
          faker.commerce.productAdjective(),
          faker.commerce.productMaterial(),
          faker.word.adjective(),
        ],
        featured: faker.datatype.boolean(),
        weight: faker.helpers.maybe(() =>
          faker.number.float({ min: 0.1, max: 50, multipleOf: 0.1 })
        ),
      },
      supplierId,
    };
  };

  const getContact = (supplierId: string) => {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      supplierId,
    };
  };

  const getAddress = (supplierId: string) => {
    return {
      id: faker.string.uuid(),
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      supplierId,
    };
  };

  const getSupplier = () => {
    const supplierId = faker.string.uuid();
    return {
      id: supplierId,
      name: faker.company.name(),

      contact: getContact(supplierId),
      address: getAddress(supplierId),

      products: Array.from({ length: 1000 }).map(() => getProduct(supplierId)),
    };
  };

  const suppliersData = Array.from({ length: 100 }).map(() => getSupplier());

  const suppliers: { name: string; id: string }[] = [];
  const contacts: ReturnType<typeof getContact>[] = [];
  const addresses: ReturnType<typeof getAddress>[] = [];
  let products: ReturnType<typeof getProduct>[] = [];

  suppliersData.forEach((d) => {
    suppliers.push({ id: d.id, name: d.name });
    contacts.push({
      id: d.contact.id,
      email: d.contact.email,
      phone: d.contact.phone,
      supplierId: d.contact.supplierId,
    });
    addresses.push({
      id: d.address.id,
      street: d.address.street,
      city: d.address.city,
      country: d.address.country,
      supplierId: d.address.supplierId,
    });
    products = [...products, ...d.products];
  });

  try {
    console.log("SEED START");

    await prisma.$transaction([
      prisma.supplier.createMany({
        data: suppliers,
      }),
      prisma.contact.createMany({
        data: contacts,
      }),
      prisma.address.createMany({
        data: addresses,
      }),
      prisma.product.createMany({
        data: products,
      }),
    ]);
  } catch (error) {
    console.log("FAILED TO SEED DATABASE");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
