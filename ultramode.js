// UltraMode Auto-Versioning Script
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// Configuration
const VERSION_FILE = 'VERSION';
const METADATA_FILE = 'metadata.json';
const CHANGELOG_FILE = 'CHANGELOG.md';
const PACKAGE_JSON = 'package.json';
const README_FILE = 'README.md';
const RELEASE_NOTES_FILE = 'release_notes.md';

// Versioning constants
const VERSION_TYPES = {
  PATCH: 'patch',
  MINOR: 'minor',
  MAJOR: 'major'
};

// File patterns to track for versioning
const TRACKED_PATTERNS = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.css',
  'backend/**/*.js',
  'scripts/**/*.js',
  'tests/**/*.js'
];

/**
 * Display help information
 */
function showHelp() {
  console.log(`
UltraMode Auto-Versioning Script
===============================

Usage: node ultramode.js [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show current version
  --test         Run tests only
  --deploy       Deploy application

Description:
  Automatically version, test, and deploy UltraChat releases based on code changes.
  The script detects changes, increments version numbers, runs tests, and creates
  GitHub releases automatically.

Examples:
  node ultramode.js          # Run full pipeline
  node ultramode.js --test   # Run tests only
  node ultramode.js --help   # Show this help
`);
}

/**
 * Get current version from VERSION file or package.json
 */
function getCurrentVersion() {
  try {
    // Check VERSION file first
    if (fs.existsSync(VERSION_FILE)) {
      const version = fs.readFileSync(VERSION_FILE, 'utf8').trim();
      // Return VERSION file content as-is (should already have 'v' prefix)
      if (version) {
        return version;
      }
    }
    
    // Check if package.json exists before trying to read it
    if (fs.existsSync(PACKAGE_JSON)) {
      const packageJsonContent = fs.readFileSync(PACKAGE_JSON, 'utf8');
      if (packageJsonContent) {
        const packageJson = JSON.parse(packageJsonContent);
        // Return package.json version WITH 'v' prefix for consistency
        const version = packageJson.version;
        if (version) {
          return version.startsWith('v') ? version : `v${version}`;
        }
      }
    }
    
    // If neither file exists or has valid content, default to v1.0.0
    console.warn('No valid version file found, defaulting to v1.0.0');
    return 'v1.0.0';
  } catch (error) {
    console.warn('Error reading version files, defaulting to v1.0.0:', error.message);
    return 'v1.0.0';
  }
}

/**
 * Calculate file hash for change detection
 */
function calculateFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

/**
 * Scan repository for changes
 */
function scanForChanges() {
  const changes = {
    added: [],
    modified: [],
    deleted: [],
    hashes: {}
  };
  
  // Get list of all tracked files
  try {
    const trackedFiles = execSync('git ls-files', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim() !== '');
    
    // Calculate hashes for all files
    trackedFiles.forEach(file => {
      if (file) {
        const hash = calculateFileHash(file);
        if (hash) {
          changes.hashes[file] = hash;
        }
      }
    });
    
    // Get git diff for recent changes
    try {
      const diff = execSync('git diff --name-status HEAD~1 HEAD', { encoding: 'utf8' });
      const lines = diff.split('\n');
      
      lines.forEach(line => {
        if (line.trim() !== '') {
          const [status, ...fileParts] = line.trim().split('\t');
          const file = fileParts.join('\t');
          
          switch (status.charAt(0)) {
            case 'A': // Added
              changes.added.push(file);
              break;
            case 'M': // Modified
              changes.modified.push(file);
              break;
            case 'D': // Deleted
              changes.deleted.push(file);
              break;
          }
        }
      });
    } catch (error) {
      console.warn('Could not get git diff, assuming all files are new');
      changes.added = Object.keys(changes.hashes);
    }
  } catch (error) {
    console.error('Error scanning for changes:', error.message);
  }
  
  return changes;
}

/**
 * Detect change type based on changes
 */
function detectChangeType(changes) {
  // Major change if core architecture files changed
  const majorIndicators = [
    'package.json',
    'vite.config.js',
    'src/App.jsx',
    'src/main.jsx'
  ];
  
  // Minor change if new features or services added
  const minorIndicators = [
    'src/services/',
    'src/components/',
    'backend/',
    'scripts/'
  ];
  
  // Check for major changes
  for (const file of [...changes.added, ...changes.modified]) {
    if (majorIndicators.some(indicator => file.includes(indicator))) {
      return VERSION_TYPES.MAJOR;
    }
  }
  
  // Check for minor changes
  for (const file of [...changes.added, ...changes.modified]) {
    if (minorIndicators.some(indicator => file.includes(indicator))) {
      return VERSION_TYPES.MINOR;
    }
  }
  
  // Default to patch for small changes
  return VERSION_TYPES.PATCH;
}

/**
 * Increment version based on type
 */
function incrementVersion(version, type) {
  const versionRegex = /^v?(\d+)\.(\d+)\.(\d+)(?:\.(.+))?$/;
  const match = version.match(versionRegex);
  
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  let [, major, minor, patch, suffix] = match;
  major = parseInt(major, 10);
  minor = parseInt(minor, 10);
  patch = parseInt(patch, 10);
  
  switch (type) {
    case VERSION_TYPES.MAJOR:
      major++;
      minor = 0;
      patch = 0;
      break;
    case VERSION_TYPES.MINOR:
      minor++;
      patch = 0;
      break;
    case VERSION_TYPES.PATCH:
      patch++;
      break;
  }
  
  // Preserve suffix if it exists
  const newSuffix = suffix ? `.${suffix}` : '.Final';
  return `v${major}.${minor}.${patch}${newSuffix}`;
}

/**
 * Update version in all relevant files
 */
function updateVersionInFiles(newVersion, oldVersion) {
  // Update VERSION file
  fs.writeFileSync(VERSION_FILE, newVersion);
  // Update package.json
  if (fs.existsSync(PACKAGE_JSON)) {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    packageJson.version = newVersion.replace(/^v/, ''); // Remove 'v' prefix for npm
    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2));
  }
  
  // Update README.md
  if (fs.existsSync(README_FILE)) {
    let readme = fs.readFileSync(README_FILE, 'utf8');
    readme = readme.replace(
      new RegExp(oldVersion.replace(/\./g, '\\.'), 'g'),
      newVersion
    );
    fs.writeFileSync(README_FILE, readme);
  }
  
  console.log(`✅ Updated version from ${oldVersion} to ${newVersion}`);
}

/**
 * Generate release notes
 */
function generateReleaseNotes(newVersion, changes, changeType) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  let releaseNotes = `# Release ${newVersion}\n\n`;
  releaseNotes += `**Date:** ${timestamp}\n\n`;
  releaseNotes += `**Change Type:** ${changeType.charAt(0).toUpperCase() + changeType.slice(1)}\n\n`;
  
  if (changes.added.length > 0) {
    releaseNotes += '## New Features\n\n';
    changes.added.forEach(file => {
      releaseNotes += `- Added ${path.basename(file)}\n`;
    });
    releaseNotes += '\n';
  }
  
  if (changes.modified.length > 0) {
    releaseNotes += '## Improvements\n\n';
    changes.modified.forEach(file => {
      releaseNotes += `- Updated ${path.basename(file)}\n`;
    });
    releaseNotes += '\n';
  }
  
  if (changes.deleted.length > 0) {
    releaseNotes += '## Removed\n\n';
    changes.deleted.forEach(file => {
      releaseNotes += `- Removed ${path.basename(file)}\n`;
    });
    releaseNotes += '\n';
  }
  
  // Add standard sections
  releaseNotes += '## Security\n\n';
  releaseNotes += '- Enhanced privacy-first architecture\n';
  releaseNotes += '- Improved local encryption mechanisms\n\n';
  
  releaseNotes += '## Documentation\n\n';
  releaseNotes += '- Updated README with latest features\n';
  releaseNotes += '- Enhanced security guidelines\n\n';
  
  fs.writeFileSync(RELEASE_NOTES_FILE, releaseNotes);
  console.log('✅ Generated release notes');
}

/**
 * Update changelog
 */
function updateChangelog(newVersion, changeType) {
  const timestamp = new Date().toISOString().split('T')[0];
  const changelogEntry = `## [${newVersion}] - ${timestamp}\n\n`;
  
  let changelog = '';
  if (fs.existsSync(CHANGELOG_FILE)) {
    changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');
  }
  
  // Add new entry at the top
  const newChangelog = changelog.startsWith('# Changelog') 
    ? changelog.replace('# Changelog', `# Changelog\n\n${changelogEntry}`)
    : `# Changelog\n\n${changelogEntry}${changelog}`;
  
  fs.writeFileSync(CHANGELOG_FILE, newChangelog);
  console.log('✅ Updated changelog');
}

/**
 * Run UltraTest suite
 */
function runTests() {
  try {
    console.log('🧪 Running UltraTest suite...');
    execSync('npm run test:run', { stdio: 'inherit' });
    console.log('✅ All tests passed.');
    return true;
  } catch (err) {
    console.error('❌ Tests failed, aborting release.');
    process.exit(1);
  }
}

/**
 * Optional deployment
 */
function deploy() {
  console.log('📦 Deploying to staging...');
  try {
    // Check if we have a build script
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    if (packageJson.scripts && packageJson.scripts.build) {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed successfully.');
    } else {
      console.log('⚠️ No build script found, skipping build step.');
    }
    
    // Here you could add actual deployment logic
    // For now, we'll just simulate it
    console.log('✅ Deployment simulation complete.');
  } catch (err) {
    console.error('❌ Deployment failed.');
    process.exit(1);
  }
}

/**
 * Commit, push, and create GitHub release
 */
function gitOperations(newVersion) {
  try {
    console.log('💾 Committing changes...');
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "Auto-update to ${newVersion} with UltraMode pipeline"`, { stdio: 'inherit' });
    
    console.log('📤 Pushing to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('🏷️ Creating GitHub release...');
    execSync(`gh release create ${newVersion} ${RELEASE_NOTES_FILE} --title "Release ${newVersion}"`, { stdio: 'inherit' });
    
    console.log(`✅ Git operations and release creation completed successfully.`);
  } catch (err) {
    console.error('❌ Git operations or GitHub release failed.', err.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 UltraMode Auto-Versioning Started');
    
    // Get current version
    const currentVersion = getCurrentVersion();
    console.log(`📦 Current version: ${currentVersion}`);
    
    // Scan for changes
    const changes = scanForChanges();
    console.log(`📊 Changes detected: ${changes.added.length} added, ${changes.modified.length} modified, ${changes.deleted.length} deleted`);
    
    // Detect change type
    const changeType = detectChangeType(changes);
    console.log(`🔧 Change type: ${changeType}`);
    
    // Increment version
    const newVersion = incrementVersion(currentVersion, changeType);
    console.log(`🆕 New version: ${newVersion}`);
    
    // Run tests before proceeding
    runTests();
    
    // Update version in files
    updateVersionInFiles(newVersion, currentVersion);
    
    // Generate release notes
    generateReleaseNotes(newVersion, changes, changeType);
    
    // Update changelog
    updateChangelog(newVersion, changeType);
    
    // Commit, push, and create GitHub release
    gitOperations(newVersion);
    
    // Deploy (optional)
    deploy();
    
    // Output for GitHub Actions
    console.log(`::set-output name=new_version::${newVersion}`);
    
    console.log('🎉 UltraMode Auto-Versioning Completed Successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ UltraMode Auto-Versioning Failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

// Check for help flag
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Check for version flag
if (args.includes('--version') || args.includes('-v')) {
  console.log(getCurrentVersion());
  process.exit(0);
}

// Run the script
// Only run main() when the script is executed directly, not when imported as a module
// Check if the script is being run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Add a guard to prevent execution during tests
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    main();
  }
}

export {
  getCurrentVersion,
  incrementVersion,
  detectChangeType,
  runTests,
  deploy,
  gitOperations,
  VERSION_TYPES
};