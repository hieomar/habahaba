import fs from 'fs';
import path from 'path';

const dirsToDelete = [
  'artifacts/api-server',
  'artifacts/mockup-sandbox',
  'lib/db'
];

dirsToDelete.forEach(dir => {
  const absolutePath = path.resolve(dir);
  if (fs.existsSync(absolutePath)) {
    console.log(`Deleting: ${absolutePath}`);
    fs.rmSync(absolutePath, { recursive: true, force: true });
    console.log(`Deleted successfully: ${absolutePath}`);
  } else {
    console.log(`Directory does not exist, skipping: ${absolutePath}`);
  }
});
