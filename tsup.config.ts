import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'], // iife を追加
  globalName: 'gasSheetDriver', // ブラウザでのグローバル変数名
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
