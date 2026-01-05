const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testOutCount() {
    try {
        console.log('--- Starting Out Count Test ---');

        // 1. Create test students (if strictly needed, but let's try to just use existing ones or create temp ones to be safe)
        // Actually, let's just use the query logic to see what it returns for current data first.

        // Fetch students with their last log
        const students = await db.user.findMany({
            where: { role: "STUDENT" },
            include: {
                entryExitLogs: {
                    take: 1,
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        console.log(`Total Students Found: ${students.length}`);

        let outCount = 0;
        let inCount = 0;

        students.forEach(s => {
            const lastLog = s.entryExitLogs[0];
            const status = lastLog?.type === 'EXIT' ? 'OUT' : 'IN';

            if (status === 'OUT') outCount++;
            else inCount++;

            console.log(`Student: ${s.name} (${s.email}) - Last Log: ${lastLog ? lastLog.type : 'NONE'} -> Status: ${status}`);
        });

        console.log('\n--- Summary ---');
        console.log(`Total OUT: ${outCount}`);
        console.log(`Total IN: ${inCount}`);

        // Verify with a specific test case
        // Let's create a simulated movement for a specific user to ensure it updates.
        const testUser = students[0];
        if (!testUser) {
            console.log("No students found to test movement.");
            return;
        }

        console.log(`\nTesting movement for ${testUser.name}...`);

        // Log EXIT
        await db.entryExitLog.create({
            data: {
                studentId: testUser.id,
                type: 'EXIT',
                reason: 'Test Exit'
            }
        });
        console.log(`Logged EXIT for ${testUser.name}`);

        // Re-run query logic locally
        const updatedUserOut = await db.user.findUnique({
            where: { id: testUser.id },
            include: {
                entryExitLogs: {
                    take: 1,
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (updatedUserOut.entryExitLogs[0]?.type === 'EXIT') {
            console.log('✅ Correctly detected status as OUT');
        } else {
            console.error('❌ Failed to detect status as OUT');
        }

        // Log ENTRY
        await db.entryExitLog.create({
            data: {
                studentId: testUser.id,
                type: 'ENTRY',
                reason: 'Test Entry'
            }
        });
        console.log(`Logged ENTRY for ${testUser.name}`);

        // Re-run query logic locally
        const updatedUserIn = await db.user.findUnique({
            where: { id: testUser.id },
            include: {
                entryExitLogs: {
                    take: 1,
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (updatedUserIn.entryExitLogs[0]?.type === 'ENTRY') {
            console.log('✅ Correctly detected status as IN');
        } else {
            console.error('❌ Failed to detect status as IN');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await db.$disconnect();
    }
}

testOutCount();
