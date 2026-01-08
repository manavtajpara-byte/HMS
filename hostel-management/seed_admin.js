const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@hms.com';
    const password = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            password: hashedPassword,
        },
        create: {
            email,
            name: 'System Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('Admin user created/updated successfully:');
    console.log('Address: ' + email);
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
