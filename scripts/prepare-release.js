const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: Version argument is required');
  process.exit(1);
}
const currentVersion = args[0];

// Update version in package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.version = currentVersion;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');

// Check version format
if (!currentVersion.includes('-corn.')) {
  console.error('Error: Version must include "-corn." suffix');
  process.exit(1);
}

// Get upstream version
try {
  execSync('git fetch upstream');
  const upstreamVersion = execSync('git show upstream/main:package.json')
    .toString()
    .match(/"version":\s*"([^"]+)"/)[1];
  
  // Check if version is based on upstream
  if (!currentVersion.startsWith(upstreamVersion)) {
    console.warn(`Warning: Current version ${currentVersion} is not based on upstream version ${upstreamVersion}`);
    console.warn('Suggested format: [upstream-version]-corn.[increment]');
  }
} catch (error) {
  console.warn('Warning: Unable to check upstream version');
}

// Generate changelog
console.log('Generating changelog...');
execSync('pnpm release-note');

// Update version in all packages
const packages = ['admin', 'server', 'website', 'cli', 'waline'].map(pkg => 
  path.join(__dirname, '..', 'packages', pkg, 'package.json')
);

console.log(`Updating all package versions to ${currentVersion}`);
packages.forEach(pkgPath => {
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.version = currentVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✓ Updated ${path.basename(path.dirname(pkgPath))}`);
  }
});

// Generate release notes
console.log('Creating release notes...');
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const latestChanges = changelog.split('\n\n')[0];
  
  const releaseNotes = `# VanBlog ${currentVersion}

## 📝 Changelog
${latestChanges}

## 🔍 Upstream Information
- Based on: mereithhh/vanblog
- Maintainer: CornWorld
- Repository: https://github.com/CornWorld/vanblog

## 📦 Installation
\`\`\`bash
docker pull cornworld/vanblog:${currentVersion}
\`\`\`
`;
  
  fs.writeFileSync('RELEASE_NOTES.md', releaseNotes);
  console.log('✓ Release notes generated');
}

console.log('✨ Release preparation completed!'); 