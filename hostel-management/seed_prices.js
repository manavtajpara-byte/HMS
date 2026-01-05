const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.room.updateMany({
        where: { type: 'TWO_SHARING' },
        data: { price: 5000 }
    });

    await prisma.room.updateMany({
        where: { type: 'THREE_SHARING' },
        data: { price: 3500 }
    });

    console.log('Room prices updated successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
