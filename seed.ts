import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing tasks
  await prisma.tasks.deleteMany();

  // Create example tasks
  const tasks = await prisma.tasks.createMany({
    data: [
      {
        title: "Set up project repository",
        description:
          "Create a new GitHub repository and initialize it with a README and .gitignore file.",
      },
      {
        title: "Design login page",
        description:
          "Create a responsive login page layout and implement form validation.",
      },
      {
        title: "Implement authentication",
        description:
          "Integrate email and password-based authentication using Supabase Auth.",
      },
    ],
  });

  console.log(`✅ Created ${tasks.count} tasks`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
