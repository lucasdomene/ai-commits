// Quick test for git commit functionality
const { 
  commitChanges, 
  commitChangesWithBody,
  validateCommitMessage,
  getLastCommit,
  hasCommits
} = require('./dist/lib/git');

async function testGitCommitFunctionality() {
  console.log('🧪 Testing Git Commit Functionality...\n');
  
  try {
    // Test commit message validation
    console.log('📝 Testing Commit Message Validation:');
    
    // Test valid message
    try {
      validateCommitMessage('feat: add git commit functionality');
      console.log('  ✅ Valid conventional commit message accepted');
    } catch (error) {
      console.log('  ❌ Valid message rejected:', error.message);
    }
    
    // Test invalid messages
    try {
      validateCommitMessage('');
      console.log('  ❌ Empty message should be rejected');
    } catch (error) {
      console.log('  ✅ Empty message properly rejected:', error.message);
    }
    
    try {
      validateCommitMessage('short');
      console.log('  ❌ Short message should be rejected');
    } catch (error) {
      console.log('  ✅ Short message properly rejected:', error.message);
    }
    
    // Test commit history
    console.log('\n📚 Testing Commit History:');
    const hasHistory = await hasCommits();
    console.log(`  Repository has commits: ${hasHistory ? '✅' : '❌'}`);
    
    if (hasHistory) {
      const lastCommit = await getLastCommit();
      console.log('  Last commit:');
      console.log(`    Hash: ${lastCommit.hash.substring(0, 8)}`);
      console.log(`    Subject: ${lastCommit.subject}`);
      console.log(`    Author: ${lastCommit.author}`);
      console.log(`    Date: ${lastCommit.date}`);
    }
    
    console.log('\n🎉 Git commit functionality testing complete!');
    console.log('\nTo test actual committing:');
    console.log('1. Stage some changes: git add <files>');
    console.log('2. Test commit: node -e "require(\'./dist/lib/git\').commitChanges(\'test: verify commit functionality\')"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGitCommitFunctionality(); 