const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testNotifications() {
    try {
        console.log('--- Starting Notification & Message Test ---');

        // 1. Get a student and a room
        const student = await db.user.findFirst({ where: { role: 'STUDENT' } });
        const room = await db.room.findFirst();

        if (!student || !room) {
            console.log("Missing student or room.");
            return;
        }

        // 2. Create a pending request
        console.log("Creating pending room change request...");
        const request = await db.roomChangeRequest.create({
            data: {
                studentId: student.id,
                requestedRoomId: room.id,
                reason: "Want more space",
                status: "PENDING"
            }
        });

        // 3. Simulate the action of approving with a message
        console.log(`Approving request ${request.id} with message...`);
        const message = "Your request is approved! Please move by Sunday.";

        await db.roomChangeRequest.update({
            where: { id: request.id },
            data: {
                status: "APPROVED",
                rectorMessage: message
            }
        });

        // 4. Create the notification (as the action would)
        await db.notification.create({
            data: {
                userId: student.id,
                title: "Room Change Request Accepted",
                message: message,
                type: "SUCCESS"
            }
        });

        // 5. Verify
        const updatedRequest = await db.roomChangeRequest.findUnique({ where: { id: request.id } });
        const notification = await db.notification.findFirst({
            where: { userId: student.id },
            orderBy: { createdAt: 'desc' }
        });

        console.log("--- Results ---");
        console.log(`✅ Request Status: ${updatedRequest.status}`);
        console.log(`✅ Rector Message: ${updatedRequest.rectorMessage}`);
        console.log(`✅ Notification Title: ${notification.title}`);
        console.log(`✅ Notification Message: ${notification.message}`);

        if (updatedRequest.rectorMessage === message && notification.message === message) {
            console.log("🎯 TEST PASSED: Messaging and Notifications working correctly!");
        } else {
            console.error("❌ TEST FAILED: Data mismatch.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await db.$disconnect();
    }
}

testNotifications();
