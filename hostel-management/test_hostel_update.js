const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testUpdate() {
    try {
        // Test 1: Update to a new name
        console.log('Test 1: Updating hostel name to "Test Hostel 123"...');
        const result1 = await db.hostelSettings.upsert({
            where: { id: 'default' },
            update: {
                hostelName: 'Test Hostel 123',
            },
            create: {
                id: 'default',
                hostelName: 'Test Hostel 123',
            }
        });
        console.log('✓ Success:', result1);

        // Test 2: Verify the update
        console.log('\nTest 2: Verifying the update...');
        const current = await db.hostelSettings.findFirst({
            where: { id: 'default' }
        });
        console.log('✓ Current hostel name:', current?.hostelName);

        // Test 3: Update to final name
        console.log('\nTest 3: Updating to "White Hart Boys Hostel"...');
        const result2 = await db.hostelSettings.upsert({
            where: { id: 'default' },
            update: {
                hostelName: 'White Hart Boys Hostel',
            },
            create: {
                id: 'default',
                hostelName: 'White Hart Boys Hostel',
            }
        });
        console.log('✓ Success:', result2);

        console.log('\n✅ All tests passed! Database is working correctly.');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.$disconnect();
    }
}

testUpdate();
