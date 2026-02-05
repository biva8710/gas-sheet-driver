import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/browser.ts', 'src/vite-plugin.ts'],
  format: ['cjs', 'esm', 'iife'], // iife を追加
  globalName: 'gasSheetDriver', // ブラウザでのグローバル変数名
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true, // __dirname などを ESM でも使えるようにする
});
