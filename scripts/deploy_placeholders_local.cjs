const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/js/data.js');
const templatePath = path.join(__dirname, '../public/images/exercises/placeholder_template.png');

if (!fs.existsSync(dataPath)) {
    console.error('Missing data.js');
    process.exit(1);
}
if (!fs.existsSync(templatePath)) {
    console.error('Missing placeholder_template.png');
    process.exit(1);
}

let content = fs.readFileSync(dataPath, 'utf8');

// Regex to find exercise blocks and update image URLs
// We look for: id: 'ID' ... image: 'OLD_URL'
// Note: This relies on `image:` coming after `id:` which is standard in this file.
// We capture up to `image:` to preserve content.

const regex = /(id:\s*'([\w-]+)',[\s\S]*?)image:\s*'([^']+)'/g;

let count = 0;
const newContent = content.replace(regex, (match, before, id, oldUrl) => {
    if (id === 'single-leg-stand') {
        return match; // Preserve existing custom image
    }

    // Create local file copy
    const destPath = path.join(__dirname, `../public/images/exercises/${id}.png`);
    if (!fs.existsSync(destPath)) {
        fs.copyFileSync(templatePath, destPath);
        console.log(`Created placeholder file for: ${id}`);
    }

    // Return updated line
    const newUrl = `/images/exercises/${id}.png`;
    count++;
    return `${before}image: '${newUrl}'`;
});

fs.writeFileSync(dataPath, newContent);
console.log(`Updated ${count} exercises to point to local placeholder files.`);
