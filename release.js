import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root_dir = path.dirname(fileURLToPath(import.meta.url));
const smuzi_dir = path.join(root_dir, 'smuzi');

const publish_order = [
  'faker',
  'tests',
  'schema',
  'console',
  'database',
  'db-postgres',
  'http-client',
  'http-server',
  'ssr',
];

function readPackageJson(package_dir) {
  const file_path = path.join(package_dir, 'package.json');
  return { file_path, data: JSON.parse(fs.readFileSync(file_path, 'utf8')) };
}

function getPublishablePackageDirs() {
  return publish_order.map((package_name) => path.join(smuzi_dir, package_name));
}

function publishPackage(package_dir) {
  const { data: package_json } = readPackageJson(package_dir);
  execSync('pnpm publish', { cwd: package_dir, stdio: 'inherit' });
  return { name: package_json.name, version: package_json.version };
}

function main() {
  const published_packages = getPublishablePackageDirs().map(publishPackage);

  console.log('\nPublished packages:');
  published_packages.forEach(({ name, version }) => {
    console.log(`  ${name}@${version}`);
  });
}

main();
