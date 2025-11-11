// Test helper function - simple pass/fail with name and result
// Automatically tracks passed/failed counts

export function createTestRunner() {
  let passed = 0;
  let failed = 0;
  
  const testMethod = async (
    name: string,
    fn: () => Promise<any>,
    expectedType?: string
  ): Promise<void> => {
    try {
      const result = await fn();
      const resultType = typeof result;
      const testPassed = expectedType ? resultType === expectedType : true;
      
      if (testPassed) {
        const resultStr = typeof result === 'object' && result !== null 
          ? JSON.stringify(result).substring(0, 50) + (JSON.stringify(result).length > 50 ? '...' : '')
          : String(result);
        console.log(`✓ ${name} = ${resultStr} (${resultType})`);
        passed++;
      } else {
        console.log(`✗ ${name} = ${result} (${resultType}, expected ${expectedType})`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${name} failed: ${error.message}`);
      failed++;
    }
  };
  
  const testMethodArray = async (
    name: string,
    fn: () => Promise<any[]>
  ): Promise<void> => {
    try {
      const result = await fn();
      const isArray = Array.isArray(result);
      if (isArray) {
        console.log(`✓ ${name} = [${result.length} items]`);
        if (result.length > 0 && result.length <= 5) {
          console.log(`  Items: ${result.join(', ')}`);
        } else if (result.length > 5) {
          console.log(`  First 5: ${result.slice(0, 5).join(', ')}...`);
        }
        passed++;
      } else {
        console.log(`✗ ${name} = ${result} (not an array)`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${name} failed: ${error.message}`);
      failed++;
    }
  };
  
  const getStats = () => ({ passed, failed, total: passed + failed });
  
  // Helper to manually increment passed (for parallel results)
  const markPassed = (name: string, result: any, resultType: string) => {
    const resultStr = typeof result === 'object' && result !== null 
      ? JSON.stringify(result).substring(0, 50) + (JSON.stringify(result).length > 50 ? '...' : '')
      : String(result);
    console.log(`✓ ${name} = ${resultStr} (${resultType})`);
    passed++;
  };
  
  const markFailed = (name: string, error: string) => {
    console.log(`✗ ${name} failed: ${error}`);
    failed++;
  };
  
  return { testMethod, testMethodArray, getStats, markPassed, markFailed };
}

