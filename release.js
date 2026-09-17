import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root_dir = path.dirname(fileURLToPath(import.meta.url));
const smuzi_dir = path.join(root_dir, 'smuzi');
const std_dir = path.join(smuzi_dir, 'std');

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

function getPublishablePackageDirs() {
  return publish_order.map((package_name) => path.join(smuzi_dir, package_name));
}

function bumpStdVersion() {
  const { file_path, data: package_json } = readPackageJson(std_dir);
  const old_version = package_json.version;
  package_json.version = bumpPatchVersion(old_version);
  writePackageJson(file_path, package_json);
  return { old_version, new_version: package_json.version };
}

function commitStdVersionBump() {
  execSync('git commit -a -m "update std version"', { cwd: root_dir, stdio: 'inherit' });
}

function publishPackage(package_dir) {
  const { data: package_json } = readPackageJson(package_dir);
  execSync('pnpm publish', { cwd: package_dir, stdio: 'inherit' });
  return { name: package_json.name, version: package_json.version };
}

function main() {
  const publish_only = process.argv.includes('--publish-only');

  if (!publish_only) {
    const { old_version, new_version } = bumpStdVersion();
    console.log(`@smuzi/std: ${old_version} -> ${new_version}`);

    commitStdVersionBump();
  }

  const published_packages = getPublishablePackageDirs().map(publishPackage);

  console.log('\nPublished packages:');
  published_packages.forEach(({ name, version }) => {
    console.log(`  ${name}@${version}`);
  });
}

main();
