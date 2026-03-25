import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs'
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
      const dmeFile = resolve(process.cwd(), 'src/tokens/dme-defaults.json');
      server.middlewares.use('/__dme_read', (req, res) => {
        try {
          const data = readFileSync(dmeFile, 'utf8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      server.middlewares.use('/__dme_save', jsonPostHandler(dmeFile));
      server.middlewares.use('/__profile_save', jsonPostHandler(
        resolve(process.cwd(), 'src/tokens/profile-data.json')
      ));
      server.middlewares.use('/__comments_save', jsonPostHandler(
        resolve(process.cwd(), 'src/data/comments.json')
      ));

      /* ── Audit log endpoints ─────────────────────────────────── */
      const auditDir = resolve(process.cwd(), 'src/data/audit-logs');
      if (!existsSync(auditDir)) mkdirSync(auditDir, { recursive: true });

      server.middlewares.use('/__audit_save', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        let body = '';
        req.on('data', c => { body += c; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const d = new Date(data.timestamp);
            const pad = n => String(n).padStart(2, '0');
            const fname = `audit-${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.json`;
            writeFileSync(resolve(auditDir, fname), JSON.stringify(data, null, 2), 'utf8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, file: fname }));
          } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })); }
        });
      });

      server.middlewares.use('/__audit_list', (_req, res) => {
        try {
          const files = readdirSync(auditDir)
            .filter(f => f.startsWith('audit-') && f.endsWith('.json'))
            .sort().reverse();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(files));
        } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })); }
      });

      server.middlewares.use('/__audit_read', (req, res) => {
        const url = new URL(req.url, 'http://localhost');
        const file = url.searchParams.get('file');
        if (!file || !file.startsWith('audit-') || file.includes('..')) {
          res.statusCode = 400; res.end('Bad request'); return;
        }
        try {
          const data = readFileSync(resolve(auditDir, file), 'utf8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        } catch (e) { res.statusCode = 404; res.end(JSON.stringify({ error: e.message })); }
      });
    },
    /* Suppress HMR reload when persisted JSON files are saved */
    handleHotUpdate({ file }) {
      if (file.endsWith('dme-defaults.json') || file.endsWith('profile-data.json') || file.endsWith('comments.json') || file.includes('audit-logs')) return [];
    },
  };
}

export default defineConfig({
  plugins: [react(), devSavePlugin()],
  server: { port: parseInt(process.env.PORT) || 5199, host: true },
})
