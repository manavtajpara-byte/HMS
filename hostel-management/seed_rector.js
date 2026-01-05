const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = 'demo_rector@hostel.com';

    await prisma.user.upsert({
        where: { email: email },
        update: {
            password: hashedPassword,
            role: 'RECTOR',
            name: 'Demo Rector'
        },
        create: {
            email: email,
            name: 'Demo Rector',
            password: hashedPassword,
            role: 'RECTOR'
        }
    });

    console.log('Demo Rector account created successfully!');
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
