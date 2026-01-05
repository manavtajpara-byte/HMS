const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function updateHostelName() {
    try {
        const result = await db.hostelSettings.upsert({
            where: { id: 'default' },
            update: {
                hostelName: 'White Hart Boys Hostel',
            },
            create: {
                id: 'default',
                hostelName: 'White Hart Boys Hostel',
            }
        });
        console.log('Hostel name updated to:', result.hostelName);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.$disconnect();
    }
}

updateHostelName();
