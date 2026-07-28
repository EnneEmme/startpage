import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Production Build', () => {
  it('should generate a single index.html file under 1MB', () => {
    const filePath = path.resolve(__dirname, '../dist/index.html');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const stats = fs.statSync(filePath);
    const sizeInMB = stats.size / (1024 * 1024);
    
    expect(sizeInMB).toBeLessThan(1);
  });

  it('should not contain console.log statements', () => {
    const filePath = path.resolve(__dirname, '../dist/index.html');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    expect(content).not.toContain('console.log(');
  });
});
