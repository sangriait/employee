const screenshot = require('screenshot-desktop');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function run() {
    const outputPath = process.argv[2];
    const quality = parseInt(process.argv[3]) || 80;

    if (!outputPath) {
        console.error('No output path provided');
        process.exit(1);
    }

    try {
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Capture
        const imgBuffer = await screenshot({ format: 'png' });

        // Compress and save
        await sharp(imgBuffer)
            .jpeg({ quality })
            .toFile(outputPath);

        process.exit(0);
    } catch (error) {
        console.error('Worker error:', error);
        process.exit(1);
    }
}

run();
