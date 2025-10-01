import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const version = env.VITE_APP_VERSION || 'v1'
  
  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      host: true
    },
    base: mode === 'production' ? `/${version}/` : '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'ant-design': ['ant-design-vue'],
            'vendor': ['vue', 'vue-router', 'pinia'],
            'i18n': ['vue-i18n', 'dayjs']
          }
        }
      }
    }
      // build: {
      //   outDir: '../public/app',
      //   emptyOutDir: true,
      //   rollupOptions: {
      //     output: {
      //       manualChunks: {
      //         'ant-design': ['ant-design-vue'],
      //         'vendor': ['vue', 'vue-router', 'pinia']
      //       }
      //     }
      //   }
      // }

  }
})
