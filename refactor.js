import fs from 'fs';
import path from 'path';

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](?:\.\.\/)+engine\/[^'"]+['"];/g, "import { $1 } from '../engine';");
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](?:\.\.\/)+components\/[^'"]+['"];/g, "import { $1 } from '../components';");
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](?:\.\.\/)+stores\/[^'"]+['"];/g, "import { $1 } from '../stores';");
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](?:\.\.\/)+hooks\/[^'"]+['"];/g, "import { $1 } from '../hooks';");

      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('./src/components');
replaceInDir('./src/hooks');
replaceInDir('./src/stores');
replaceInDir('./src/engine');
