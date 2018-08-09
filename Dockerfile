FROM node:8-alpine as builder

RUN mkdir -p /usr/src/dnb
WORKDIR /usr/src/dnb
COPY . .

RUN apk update && apk add python build-base

RUN npm install .

FROM node:8-alpine as runtime

LABEL maintainer="Tobias Bräutigam"
LABEL version="0.0.1"
LABEL description="DeerNation backend service."

RUN mkdir -p /usr/src/dnb
WORKDIR /usr/src/dnb
COPY --from=builder /usr/src/dnb .
RUN mkdir -p /etc/deernation \
    && echo '{"PLUGINS_CONTENT_DIR": "/usr/src/dnb/plugins", "PROTOS_DIR": "/usr/src/dnb/protos"}' > /etc/deernation/config.json

EXPOSE 6878

CMD ["npm", "run", "start:docker"]
