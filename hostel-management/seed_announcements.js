const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Find the first user with RECTOR role
    const rector = await prisma.user.findFirst({
        where: { role: 'RECTOR' }
    });

    if (!rector) {
        console.log("No rector found to create announcements. Please create a rector first.");
        return;
    }

    console.log(`Found rector: ${rector.email}`);

    const announcements = [
        {
            title: "Welcome to New Semester",
            content: "We are excited to welcome everyone back! Classes start next Monday.",
            authorId: rector.id,
            createdAt: new Date() // Now
        },
        {
            title: "Maintenance Notice",
            content: "The water heater in Block A will be under maintenance on Saturday.",
            authorId: rector.id,
            createdAt: new Date(Date.now() - 86400000) // Yesterday
        },
        {
            title: "Mess Menu Update",
            content: "We have updated the mess menu based on your feedback. Check the notice board.",
            authorId: rector.id,
            createdAt: new Date(Date.now() - 172800000) // 2 days ago
        }
    ];

    for (const ann of announcements) {
        await prisma.announcement.create({ data: ann });
    }

    console.log("Created 3 sample announcements.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
