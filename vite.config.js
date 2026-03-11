import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

/* ── Dev-only plugin: persists DME state & profile data to src/tokens/ ── */
function devSavePlugin() {
  function jsonPostHandler(filePath) {
    return (req, res) => {
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
          writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    };
  }

  return {
    name: 'dev-save',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__dme_save', jsonPostHandler(
        resolve(process.cwd(), 'src/tokens/dme-defaults.json')
      ));
      server.middlewares.use('/__profile_save', jsonPostHandler(
        resolve(process.cwd(), 'src/tokens/profile-data.json')
      ));
    },
    /* Suppress HMR reload when persisted JSON files are saved */
    handleHotUpdate({ file }) {
      if (file.endsWith('dme-defaults.json') || file.endsWith('profile-data.json')) return [];
    },
  };
}

export default defineConfig({
  plugins: [react(), devSavePlugin()],
  server: { port: parseInt(process.env.PORT) || 5199, host: '127.0.0.1' },
})
