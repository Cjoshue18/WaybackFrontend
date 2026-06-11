import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Solución nativa para __dirname en entornos ESM ("type": "module")
const __dirname = import.meta.dirname

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    // 🛠️ Se añade ": string" aquí para solucionar el error TS7006 (implicit any)
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // El plugin de React y Tailwind v4 son requeridos para Make
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Ahora @ apuntará correctamente a la carpeta src
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Soporte para imports crudos de archivos específicos
  assetsInclude: ['**/*.svg', '**/*.csv'],
})