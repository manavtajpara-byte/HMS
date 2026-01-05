const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testRoomRequestFetch() {
    try {
        console.log('--- Starting Room Request Fetch Test ---');

        // 1. Get a student
        const student = await db.user.findFirst({ where: { role: 'STUDENT' } });
        if (!student) {
            console.log("No student found.");
            return;
        }
        console.log(`Found student: ${student.name} (${student.id})`);

        // 2. Get a room to request
        const room = await db.room.findFirst();
        if (!room) {
            console.log("No room found.");
            return;
        }

        // 3. Create a mock request
        console.log("Creating mock room change request...");
        const request = await db.roomChangeRequest.create({
            data: {
                studentId: student.id,
                requestedRoomId: room.id,
                reason: "Test Reason for Verification script",
                status: "APPROVED" // Simulate a processed request
            }
        });
        console.log(`Request created: ${request.id} with status ${request.status}`);

        // 4. Test the specific query used in the page
        console.log("Testing page query logic...");
        const fetchedData = await db.user.findUnique({
            where: { id: student.id },
            include: {
                profile: { include: { room: true } },
                roomChangeRequests: {
                    include: { requestedRoom: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // 5. Verify results
        console.log("--- Results ---");
        if (fetchedData && fetchedData.roomChangeRequests && fetchedData.roomChangeRequests.length > 0) {
            const latestRequest = fetchedData.roomChangeRequests[0];
            console.log(`✅ Request Found: ID ${latestRequest.id}`);
            console.log(`   Status: ${latestRequest.status}`);
            console.log(`   Room: ${latestRequest.requestedRoom.number}`);

            if (latestRequest.id === request.id) {
                console.log("✅ ID matches created request.");
            } else {
                console.error("❌ ID mismatch (might be showing older requests too, which is fine)");
            }
        } else {
            console.error("❌ No room change requests returned!");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await db.$disconnect();
    }
}

testRoomRequestFetch();
