import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser'; // 1. IMPORT THE PARSER

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      
      // --- THESE ARE THE NEW, CRITICAL ADDITIONS ---
      parser: parser, // 2. Tell ESLint to use the TypeScript parser
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // 3. Tell the parser to allow JSX syntax
        },
      },
      // ---------------------------------------------
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Optional: You can turn off the "unused variable" rule for imports if it's still noisy
      // "@typescript-eslint/no-unused-vars": "off"
    },
  }
);
