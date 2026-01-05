const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = 'demo_student@hostel.com';

    await prisma.user.upsert({
        where: { email: email },
        update: {
            password: hashedPassword,
            role: 'STUDENT',
            name: 'Demo Student'
        },
        create: {
            email: email,
            name: 'Demo Student',
            password: hashedPassword,
            role: 'STUDENT',
            profile: {
                create: {
                    hostelName: 'Main Hostel',
                    degree: 'Engineering',
                    homeTown: 'Cyber City'
                }
            }
        }
    });

    console.log('Demo Student account created successfully!');
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
