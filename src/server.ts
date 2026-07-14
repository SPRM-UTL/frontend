import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

/**
 * Confía en el reverse proxy de Render para que Express lea correctamente
 * los headers x-forwarded-for, x-forwarded-host.
 */
app.set('trust proxy', true);

/**
 * Angular SSR v19+ valida el header "host" y rechaza peticiones con
 * hosts no registrados. Se deben incluir todos los dominios de producción
 * y opcionalmente localhost para desarrollo.
 */
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'manordomo-frontend.onrender.com',
    'localhost',
    '127.0.0.1',
  ],
  // Permite que Angular SSR confíe en los headers X-Forwarded-* del reverse proxy de Render.
  // Sin esto se muestra el warning: "Received x-forwarded-for header but trustProxyHeaders was not set up".
  trustProxyHeaders: true,
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Fallback for SPA routes.
 * Always serve index.html with a 200 status code to let the client router handle it.
 */
app.use((req, res, next) => {
  res.sendFile(join(browserDistFolder, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
