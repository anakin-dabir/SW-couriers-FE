import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import tailwindcss from '@poupe/eslint-plugin-tailwindcss';
import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    ignores: ['dist', 'eslint.config.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      react,
      'react-refresh': reactRefresh,
      tailwindcss,
      boundaries,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'boundaries/elements': [
        { type: 'atoms', pattern: 'src/components/atoms/*' },
        { type: 'molecules', pattern: 'src/components/molecules/*' },
        { type: 'organisms', pattern: 'src/components/organisms/*' },
        { type: 'templates', pattern: 'src/components/templates/*' },
        { type: 'pages', pattern: 'src/pages/*' },
      ],
    },
    rules: {
      // Prevent using native HTML elements for text content
      'react/forbid-elements': [
        'error',
        {
          forbid: [
            {
              element: 'p',
              message: 'Use <Typography /> instead of <p>',
            },
            {
              element: 'label',
              message: 'Use <Typography variant="label" />',
            },
            {
              element: 'h1',
            },
            {
              element: 'h2',
            },
            {
              element: 'h3',
            },
            {
              element: 'h4',
            },
            {
              element: 'h5',
            },
            {
              element: 'h6',
            },
            {
              element: 'motion',
              message:
                'Use <div> for layout. This project does not use Framer Motion or <motion> elements.',
            },
          ],
        },
      ],

      // Framer Motion is not used — prefer plain elements + Tailwind animation utilities
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXMemberExpression[object.name="motion"]',
          message:
            'Do not use motion.* (Framer Motion). Use a plain HTML element (e.g. <div>) with Tailwind classes instead.',
        },
      ],

      // Prevent importing assets from the wrong directory and react-hook-form directly
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/*.svg'],
              message: 'SVGs must be imported from src/assets/svg',
            },
            {
              group: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.webp'],
              message: 'Images must be imported from src/assets/img',
            },
          ],
          paths: [
            {
              name: 'react-hook-form',
              importNames: ['useForm'],
              message:
                'useForm must be wrapped by useFormValidation from @/hooks/useFormValidation',
            },
            {
              name: 'framer-motion',
              message:
                'Framer Motion is not used in this project. Use plain elements and Tailwind animation utilities.',
            },
            {
              name: 'motion/react',
              message:
                'Framer Motion (motion package) is not used. Use plain elements and Tailwind animation utilities.',
            },
          ],
        },
      ],

      // Atomic Design rules
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'atoms', allow: ['atoms'] },
            { from: 'molecules', allow: ['atoms', 'molecules'] },
            { from: 'organisms', allow: ['atoms', 'molecules', 'organisms'] },
            { from: 'templates', allow: ['atoms', 'molecules', 'organisms'] },
            { from: 'pages', allow: ['atoms', 'molecules', 'organisms', 'templates'] },
          ],
        },
      ],
      // Prevent explicit 'any' type usage - CRITICAL for type safety
      '@typescript-eslint/no-explicit-any': 'error',

      // Prevent unsafe operations that could lead to runtime errors
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // Require explicit return types for better type safety (warning level for flexibility)
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],

      // Enforce consistent type definitions
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'warn',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'warn',

      // Disable React Compiler warnings for react-hook-form (known limitation)
      'react-hooks/incompatible-library': 'off',

      // Tailwind CSS v4 rules (using @poupe/eslint-plugin-tailwindcss)
      'tailwindcss/no-arbitrary-value-overuse': 'warn',
      'tailwindcss/prefer-theme-tokens': 'warn',
      'tailwindcss/no-conflicting-utilities': 'error',
    },
  },
  // Allow asset index files to import from their own directory
  {
    files: ['src/assets/svg/index.ts', 'src/assets/img/index.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  // Allow useFormValidation hook to import useForm directly (it's the wrapper itself)
  {
    files: ['src/hooks/useFormValidation.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  // Vite / Node tooling — not app UI; relax rules that misfire on plugin factories
  {
    files: ['vite.config.ts', 'vite-plugin-*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'react/forbid-elements': 'off',
      'no-restricted-imports': 'off',
      'boundaries/element-types': 'off',
    },
  },
];
