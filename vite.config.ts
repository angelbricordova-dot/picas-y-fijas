import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** En desarrollo, sirve /api/room con la misma función que usa Vercel (salas en memoria). */
function devApi(): Plugin {
  return {
    name: 'pyf-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/room', async (req, res) => {
        const mod = await server.ssrLoadModule('/api/room.ts');
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const method = req.method ?? 'GET';
        const request = new Request(`http://localhost${req.originalUrl ?? req.url}`, {
          method,
          headers: { 'content-type': String(req.headers['content-type'] ?? 'application/json') },
          body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
        });
        const handler = mod[method] as ((r: Request) => Promise<Response>) | undefined;
        const response = handler ? await handler(request) : new Response('Method not allowed', { status: 405 });
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi()],
  server: { host: true },
});
