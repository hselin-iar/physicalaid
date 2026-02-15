const fs = require('fs');
const path = require('path');

const dataPath = '/Users/hselin/.gemini/antigravity/scratch/physicalaid/src/js/data.js';

if (!fs.existsSync(dataPath)) {
    console.error('File not found:', dataPath);
    process.exit(1);
}

let content = fs.readFileSync(dataPath, 'utf8');

// Regex to find existing placeholder URLs
// We want to replace 'https://placehold.co/...' with 'https://loremflickr.com/...'
// But ONLY if it's a placeholder. We should NOT touch '/images/...'

const regex = /image:\s*'https:\/\/placehold\.co[^']*',/g;

let count = 0;
const newContent = content.replace(regex, (match) => {
    count++;
    // Use lock to ensure consistent but different images
    return `image: 'https://loremflickr.com/600/400/fitness,exercise,yoga?lock=${count + 100}',`;
});

fs.writeFileSync(dataPath, newContent);
console.log(`Replaced ${count} placeholder images in data.js with LoremFlickr stock photos.`);
