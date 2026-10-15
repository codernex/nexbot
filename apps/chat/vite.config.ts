import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isWebComponent = mode === 'webcomponent'

  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    build: isWebComponent
      ? {
          lib: {
            entry: './src/web-component.tsx',
            name: 'NexChat',
            fileName: () => 'nex-chat.js',
            formats: ['iife'],
          },
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
        }
      : {
          outDir: 'dist',
        },
  }
})
