# Identity Management Frontend

## Configuration

Configuration is done exclusively via the environment file `.env`. To get started copy `.env.example` to `.env` and modify `.env`.

## Build / Dev Setup

### Docker

1. Optionally put an SSL key (`key.pem`) and certificate (`cert.pem`) in `deploy/ssl`. These are used to enable HTTP/2 on the docker container. If you don't provide them self-signed certificates will be created for the docker container
2. Build the docker container using `docker build`

### Local

1. Install the dependencies by running `npm ci` (or if it fails `npm i`).
2. To build the app for production use run `npm run build`. For an example nginx configuration to serve the files see `deploy/nginx.conf`. To run the development server instead run `npm start`.

## Deployment

### Reverse Proxy setup

1. `/api/*` -> [Backend](https://github.com/Samedis-care/identity-management-backend/)
2. `/api-docs/*` -> [Backend](https://github.com/Samedis-care/identity-management-backend/)
3. `/*` -> Frontend
