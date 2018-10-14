import fs from 'fs';
import path from 'path';

export const readConfig = () => {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), '.packerrc.json'), 'utf8'));
};

export const readPackageData = () => {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
};

export const readCLIPackageData = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
};
