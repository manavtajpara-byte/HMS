const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    await prisma.hostelSettings.upsert({
        where: { id: 'default' },
        update: {
            hostelName: 'University Hostel',
        },
        create: {
            id: 'default',
            hostelName: 'University Hostel',
        }
    });

    console.log('Hostel settings initialized successfully!');
    console.log('Default hostel name: University Hostel');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
