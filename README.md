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

### Local

1. Install the dependencies by running `npm ci` (or if it fails `npm i`).
2. To build the app for production use run `npm run build`. For an example nginx configuration to serve the files see `deploy/nginx.conf`. To run the development server instead run `npm start`.

## Deployment

### Reverse Proxy setup

1. `/api/*` -> [Backend](https://github.com/Samedis-care/identity-management-backend/)
2. `/api-docs/*` -> [Backend](https://github.com/Samedis-care/identity-management-backend/)
3. `/*` -> Frontend
