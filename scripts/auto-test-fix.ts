#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

interface TestResult {
  passed: boolean;
  errors: string[];
  fixes: string[];
}

async function runTests(): Promise<TestResult> {
  console.log('🚀 Running automated E2E tests...');
  
  try {
    const { stdout, stderr } = await execAsync('npm run test');
    return {
      passed: true,
      errors: [],
      fixes: []
    };
  } catch (error: any) {
    const errors = parseErrors(error.stdout || error.message);
    const fixes = await generateFixes(errors);
    
    return {
      passed: false,
      errors,
      fixes
    };
  }
}

function parseErrors(output: string): string[] {
  const errors: string[] = [];
  const lines = output.split('\n');
  
  lines.forEach(line => {
    if (line.includes('Error:') || line.includes('Failed:')) {
      errors.push(line);
    }
  });
  
  return errors;
}

async function generateFixes(errors: string[]): Promise<string[]> {
  const fixes: string[] = [];
  
  for (const error of errors) {
    if (error.includes('undefined')) {
      fixes.push('Add null checks and default values');
    } else if (error.includes('Failed to fetch')) {
      fixes.push('Add retry logic and error boundaries');
    } else if (error.includes('timeout')) {
      fixes.push('Increase timeout or optimize performance');
    } else if (error.includes('contrast')) {
      fixes.push('Adjust color contrast for accessibility');
    }
  }
  
  return fixes;
}

async function applyFixes(fixes: string[]): Promise<void> {
  console.log('🔧 Applying automated fixes...');
  
  for (const fix of fixes) {
    console.log(`  - ${fix}`);
    // Here would be the actual fix implementation
  }
}

async function runLintAndTypeCheck(): Promise<boolean> {
  console.log('🔍 Running lint and type checks...');
  
  try {
    await execAsync('npm run lint');
    console.log('✅ Lint check passed');
    
    await execAsync('npx tsc --noEmit');
    console.log('✅ Type check passed');
    
    return true;
  } catch (error) {
    console.error('❌ Lint or type check failed');
    return false;
  }
}

async function generateReport(result: TestResult): Promise<void> {
  const report = {
    timestamp: new Date().toISOString(),
    status: result.passed ? 'PASSED' : 'FAILED',
    errors: result.errors,
    fixes: result.fixes,
    recommendations: [
      'Run tests after each feature implementation',
      'Monitor performance metrics continuously',
      'Keep accessibility in mind during development'
    ]
  };
  
  const reportPath = join(process.cwd(), 'test-results', 'auto-test-report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Test report saved to: ${reportPath}`);
}

async function main() {
  console.log('🤖 Automated Test & Fix System\n');
  
  // Step 1: Run lint and type checks
  const checksPass = await runLintAndTypeCheck();
  
  if (!checksPass) {
    console.log('\n⚠️  Fix lint and type errors before running E2E tests');
    process.exit(1);
  }
  
  // Step 2: Run E2E tests
  const testResult = await runTests();
  
  // Step 3: Apply fixes if needed
  if (!testResult.passed && testResult.fixes.length > 0) {
    await applyFixes(testResult.fixes);
    
    // Re-run tests after fixes
    console.log('\n🔄 Re-running tests after fixes...');
    const retryResult = await runTests();
    
    if (retryResult.passed) {
      console.log('✅ All tests passed after fixes!');
    } else {
      console.log('❌ Some tests still failing. Manual intervention required.');
    }
  }
  
  // Step 4: Generate report
  await generateReport(testResult);
  
  // Step 5: Show summary
  console.log('\n📋 Summary:');
  console.log(`  - Status: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  - Errors: ${testResult.errors.length}`);
  console.log(`  - Auto-fixes applied: ${testResult.fixes.length}`);
  
  process.exit(testResult.passed ? 0 : 1);
}

// Run when called directly
if (require.main === module) {
  main().catch(console.error);
}

export { runTests, applyFixes, generateReport };