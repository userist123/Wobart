import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'frontend/**',
    'backend/**',
    'public/**',
    'test_reports/**',
    'next-env.d.ts',
    'tsconfig.tsbuildinfo',
  ]),
])
