const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = 'demo_inspector@hostel.com';

    await prisma.user.upsert({
        where: { email: email },
        update: {
            password: hashedPassword,
            role: 'INSPECTOR',
            name: 'Demo Inspector'
        },
        create: {
            email: email,
            name: 'Demo Inspector',
            password: hashedPassword,
            role: 'INSPECTOR'
        }
    });

    console.log('Demo Inspector account created successfully!');
    console.log('Email: ' + email);
    console.log('Password: ' + password);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
