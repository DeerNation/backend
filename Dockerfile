FROM node:8-slim

LABEL maintainer="Tobias Bräutigam"
LABEL version="0.0.1"
LABEL description="Docker file for DeerNation backend service."

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY . /usr/src/

RUN apt-get update && apt-get install -y -q python build-essential

RUN npm install .

EXPOSE 8000

CMD ["npm", "run", "start:docker"]
