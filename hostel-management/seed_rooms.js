const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding rooms...');

    // Create 5 Two-Sharing Rooms
    for (let i = 101; i <= 105; i++) {
        await prisma.room.upsert({
            where: { number: `A-${i}` },
            update: {},
            create: {
                number: `A-${i}`,
                type: 'TWO_SHARING',
                capacity: 2
            }
        });
    }

    // Create 5 Three-Sharing Rooms
    for (let i = 201; i <= 205; i++) {
        await prisma.room.upsert({
            where: { number: `B-${i}` },
            update: {},
            create: {
                number: `B-${i}`,
                type: 'THREE_SHARING',
                capacity: 3
            }
        });
    }

    console.log('Rooms seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
