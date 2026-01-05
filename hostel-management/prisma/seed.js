const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Rector
    const rector = await prisma.user.upsert({
        where: { email: 'rector@hostel.com' },
        update: {},
        create: {
            email: 'rector@hostel.com',
            name: 'Dr. Rector',
            password: hashedPassword,
            role: 'RECTOR',
        },
    });

    // Create Inspector
    const inspector = await prisma.user.upsert({
        where: { email: 'inspector@hostel.com' },
        update: {},
        create: {
            email: 'inspector@hostel.com',
            name: 'Inspector General',
            password: hashedPassword,
            role: 'INSPECTOR',
        },
    });

    // Create Student
    const student = await prisma.user.upsert({
        where: { email: 'student@hostel.com' },
        update: {},
        create: {
            email: 'student@hostel.com',
            name: 'John Student',
            password: hashedPassword,
            role: 'STUDENT',
            profile: {
                create: {
                    roomNumber: '101',
                    hostelName: 'Block A',
                    gender: 'Male',
                    contactNumber: '1234567890',
                }
            }
        },
    });

    console.log({ rector, inspector, student });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
