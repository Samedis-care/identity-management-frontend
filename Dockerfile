# build environment
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
RUN apk add --no-cache brotli openssl bash grep git openssh-client moreutils

WORKDIR /app
# only copy package.json and package-lock.json to use docker cache for node_modules
COPY package.json package-lock.json ./
RUN npm ci

# copy source files and config files and build
COPY public ./public/
COPY src ./src/
COPY tsconfig.json webpack.config.cjs ./
RUN npm run build

# perform static compression (gzip and brotli)
RUN find build -type f -print0 | xargs -0 -P `nproc` -n 1 gzip -9k && \ 
    find build -type f ! -name '*.gz' -print0 | xargs -0 -P `nproc` -n 1 brotli  -Zk --

# production environment
FROM fholzer/nginx-brotli:mainline-latest

COPY --from=build /app/build /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html/

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security*.conf /etc/nginx/
COPY deploy/ssl/* /etc/nginx/ssl/
COPY deploy/server.conf /etc/nginx/