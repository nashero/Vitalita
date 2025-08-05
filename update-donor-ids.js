import fs from 'fs';

const oldHashId = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
const newHashId = 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14';

// Read the file
const filePath = 'seed-donation-history.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences
const updatedContent = content.replace(new RegExp(oldHashId, 'g'), newHashId);

// Write back to file
fs.writeFileSync(filePath, updatedContent);

console.log('✅ Updated all donor hash IDs in seed-donation-history.js');
console.log(`   From: ${oldHashId.substring(0, 20)}...`);
console.log(`   To:   ${newHashId.substring(0, 20)}...`); 