import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/react/index.ts'],
  format: 'esm',
  platform: 'neutral',
  dts: true,
  clean: true,
  treeshake: true,
});
