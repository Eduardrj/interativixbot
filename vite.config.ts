import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Vite já injeta automaticamente variáveis com prefixo VITE_
    // Não precisa usar define, elas vêm do processo de build
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [dyadComponentTagger(), react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
