# build environment
FROM node:21-alpine AS build
RUN apk add --no-cache brotli openssl bash grep git openssh-client

WORKDIR /app
# only copy package.json and package-lock.json to use docker cache for node_modules
COPY package.json package-lock.json ./
RUN npx npm@10 ci

# copy source files and config files and build
COPY public ./public/
COPY src ./src/
COPY tsconfig.json webpack.config.cjs .env ./
RUN npx npm@10 run build

# perform static compression (gzip and brotli)
RUN find build -type f -exec gzip -9k {} + -exec brotli -Zk {} +

COPY deploy/ssl ./

# generate nginx http2_push config
RUN bash -c 'while read file; do echo "http2_push $file;"; done <<< $(grep -oP "/static/js/.*?.js" build/index.html) > http2_push.conf'
# generate self signed cert if none was supplied
RUN bash -c '[ -f "key.pem" ] || openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/C=DE/ST=Local/L=Local/O=Local/OU=Local/CN=Local/emailAddress=ssl@localhost"'

# production environment
FROM fholzer/nginx-brotli:mainline-latest

COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/http2_push.conf /etc/nginx/
COPY --from=build /app/key.pem /app/cert.pem /etc/nginx/ssl/

RUN chown -R nginx:nginx /usr/share/nginx/html/

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security*.conf /etc/nginx/
