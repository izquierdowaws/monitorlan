import prisma from './src/db';

async function main() {
    try {
        const count = await prisma.device.count();
        console.log(`Total devices in DB: ${count}`);
        const devices = await prisma.device.findMany();
        console.log('Devices:', devices);
    } catch (e) {
        console.error('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
