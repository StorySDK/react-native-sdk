import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { string } from 'rollup-plugin-string';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

// Get bundle version from env or package.json as fallback
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
const bundleVersion = process.env.BUNDLE_VERSION || packageJson.version;

// Plugin to replace version in HTML files
function replaceVersion() {
  return {
    name: 'replace-version',
    generateBundle() {
      // Read the HTML file
      const htmlPath = join('src', 'sdk.html');
      let htmlContent = readFileSync(htmlPath, 'utf8');
      
      // Replace the hardcoded version with the environment version
      htmlContent = htmlContent.replace(
        /const BUNDLE_VERSION = '[^']*';/,
        `const BUNDLE_VERSION = '${bundleVersion}';`
      );
      
      // Replace @storysdk/core version in CSS links
      htmlContent = htmlContent.replace(
        /@storysdk\/core@[^\/]*/g,
        `@storysdk/core@${bundleVersion}`
      );
      
      // Write the updated HTML to dist
      writeFileSync(join('dist', 'sdk.html'), htmlContent);
    }
  };
}

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    string({
      include: '**/*.html',
      transform(code, id) {
        // Replace version in HTML content when importing as string
        if (id.endsWith('.html')) {
          let transformedCode = code.replace(
            /const BUNDLE_VERSION = '[^']*';/,
            `const BUNDLE_VERSION = '${bundleVersion}';`
          );
          
          // Replace @storysdk/core version in CSS links
          transformedCode = transformedCode.replace(
            /@storysdk\/core@[^\/]*/g,
            `@storysdk/core@${bundleVersion}`
          );
          
          return transformedCode;
        }
        return code;
      }
    }),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/__tests__', '**/*.test.tsx'],
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
    replaceVersion(), // Custom plugin to handle HTML file replacement
  ],
  external: ['react', 'react-native', 'react-native-webview'],
}; 