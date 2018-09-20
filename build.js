let packageJson = require('./package.json');
const fs = require('fs');
const path = require('path');

delete packageJson.scripts;
delete packageJson.devDependencies;

fs.writeFileSync(path.join(process.cwd(), 'dist/package.json'), JSON.stringify(packageJson, null, 2));