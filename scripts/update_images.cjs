const fs = require('fs');
const path = require('path');

const dataPath = '/Users/hselin/.gemini/antigravity/scratch/physicalaid/src/js/data.js';

if (!fs.existsSync(dataPath)) {
    console.error('File not found:', dataPath);
    process.exit(1);
}

let content = fs.readFileSync(dataPath, 'utf8');

// Regex to find exercise definitions and inject image property if missing.
// We look for `id: '...', ... emoji: '...'`
// We inject `image: '...',` before `emoji:`
// We use a lookahead or capture groups.

// To avoid duplicate injections, we check if `image:` is already present between `id:` and `emoji:`.
// But regex lookbehind/ahead for variable length is hard.
// Instead we can use a callback.

const regex = /(id:\s*'([^']+)',[\s\S]*?)(\s+emoji:\s*)/g;

let count = 0;
const newContent = content.replace(regex, (match, before, id, emojiPart) => {
    if (before.includes('image:')) {
        return match; // Already has image
    }

    // Create readable text from ID
    const text = id.split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('+');

    // Using placehold.co with dark theme colors to match app
    const imageUrl = `https://placehold.co/600x600/1e1e24/6366f1?text=${text}&font=roboto`;

    const imageLine = `\n      image: '${imageUrl}',`;

    count++;
    return `${before}${imageLine}${emojiPart}`;
});

fs.writeFileSync(dataPath, newContent);
console.log(`Updated ${count} exercises in data.js`);
