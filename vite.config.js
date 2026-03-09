import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

/* ── Dev-only plugin: persists DME state to src/tokens/dme-defaults.json ── */
function dmeSavePlugin() {
  return {
    name: 'dme-save',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__dme_save', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const filePath = resolve(process.cwd(), 'src/tokens/dme-defaults.json');
            writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
    /* Suppress HMR reload when dme-defaults.json is saved */
    handleHotUpdate({ file }) {
      if (file.endsWith('dme-defaults.json')) return [];
    },
  };
}

export default defineConfig({
  plugins: [react(), dmeSavePlugin()],
  server: { port: parseInt(process.env.PORT) || 5199, host: '127.0.0.1' },
})
