const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function checkHostelSettings() {
    try {
        const settings = await db.hostelSettings.findFirst({
            where: { id: 'default' }
        });
        console.log('Current hostel settings:', JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.$disconnect();
    }
}

checkHostelSettings();
