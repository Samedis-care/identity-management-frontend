# Identity Management Frontend

## Configuration

Configuration is done via the runtime environment file `public/env.json` and the development config file `.env`. To get started copy `.env.example` to `.env` and modify `.env` if needed. Then copy `env-example.json` to `public/env.json` and modify that as well.

## Build / Dev Setup

### Docker

Build the docker container using `git rev-parse HEAD > public/version.txt && docker build --pull` or use the pre-built container images on GitHub. The `env.json` and `security-custom.conf` files are not included in the docker build, you must supply them at runtime!

Container mounts for configuration:
- `/usr/share/nginx/html/env.json`: Configuration file for the webapp, see `env-example.json`
- `/etc/nginx/server.conf`: Configuration file for the nginx server block, this is provided by default, you can configure HTTPS here if needed.
- `/etc/nginx/security-custom.conf`: You can define custom security headers here. For example use the `add_header` commands to set HTTP Strict Transport Security (HSTS) and Content Security Policy (CSP) headers.

If you want to change the container nginx configuration you can supply your own `server.conf` and `security-custom.conf`, you just need to mount them in the container.

To run the container locally you can use `docker run --rm -p <host-port>:80 -v </host-system/absolute/path/to/env.json>:/usr/share/nginx/html/env.json:ro container-image`

### Security headers & TLS (supply these per deployment)

The image intentionally ships **without a Content-Security-Policy, HSTS, or TLS**. These cannot be predefined because they depend on the deployment — internal vs. public, which object-storage host serves profile images, and whether TLS is terminated at an edge/reverse proxy or in the container. For any production deployment you **must** supply them:

- **Security headers (CSP, HSTS)** — mount `/etc/nginx/security-custom.conf`. The bundled `security.conf` already sets `X-Frame-Options`, `X-Content-Type-Options` and `Referrer-Policy`; add CSP and HSTS here. Starting point (replace `<OBJECT_STORAGE_HOST>` with the host that serves profile images; keep the reCAPTCHA entries only if reCAPTCHA is enabled):

  ```nginx
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline'; connect-src 'self' <OBJECT_STORAGE_HOST>; img-src 'self' data: blob: <OBJECT_STORAGE_HOST>; frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/; object-src 'none'; base-uri 'self'; form-action 'self'";
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
  ```

  `style-src 'unsafe-inline'` is required by MUI/emotion. Do **not** add `'unsafe-inline'`/`'unsafe-eval'` to `script-src` — the production bundle needs neither.

- **TLS** — the container listens on plain HTTP `:80` only. Terminate TLS at your reverse proxy/edge (recommended) or configure HTTPS in `server.conf`, enforce an HTTP→HTTPS redirect, and keep HSTS enabled.

### Local

1. Install the dependencies by running `pnpm install --frozen-lockfile` (or `pnpm install` if the lockfile is outdated).
2. To build the app for production use run `pnpm run build`. For an example nginx configuration to serve the files see `deploy/nginx.conf`. To run the development server instead run `pnpm start`.

## Deployment

### Reverse Proxy setup

1. `/api/*` -> [Backend](https://github.com/Samedis-care/identity-management-backend/)
2. `/api-docs/*` -> [Backend](https://github.com/Samedis-care/identity-management-backend/)
3. `/*` -> Frontend
