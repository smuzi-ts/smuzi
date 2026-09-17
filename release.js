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

function writePackageJson(file_path, data) {
  fs.writeFileSync(file_path, JSON.stringify(data, null, 2) + '\n');
}

function bumpPatchVersion(version) {
  const parts = version.split('.').map(Number);
  parts[2] += 1;
  return parts.join('.');
}

function bumpPackageVersion(package_dir) {
  const { file_path, data: package_json } = readPackageJson(package_dir);
  const new_version = bumpPatchVersion(package_json.version);
  package_json.version = new_version;
  writePackageJson(file_path, package_json);
  return { file_path, name: package_json.name, new_version };
}

function commitPackageVersion(package_name, file_path, new_version) {
  execSync(`git add ${file_path}`, { cwd: root_dir, stdio: 'inherit' });
  execSync(`git commit -m "${package_name}: upd version to ${new_version}"`, {
    cwd: root_dir,
    stdio: 'inherit',
  });
}

function publishPackage(package_dir) {
  execSync('pnpm publish', { cwd: package_dir, stdio: 'inherit' });
}

function releasePackage(package_name) {
  const package_dir = path.join(smuzi_dir, package_name);
  const { file_path, name, new_version } = bumpPackageVersion(package_dir);

  commitPackageVersion(package_name, file_path, new_version);
  publishPackage(package_dir);

  return { name, version: new_version };
}

function main() {
  const released_packages = publish_order.map(releasePackage);

  console.log('\nPublished packages:');
  released_packages.forEach(({ name, version }) => {
    console.log(`  ${name}@${version}`);
  });
}

main();
