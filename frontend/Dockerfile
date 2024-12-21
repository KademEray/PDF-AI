# frontend/Dockerfile

# Bauen Sie das Frontend
FROM node:18 AS build

# Arbeitsverzeichnis setzen
WORKDIR /app

# Kopieren und installieren Sie die Abhängigkeiten
COPY package*.json ./
RUN npm install

# Kopieren Sie den Rest des Codes und erstellen Sie die Anwendung
COPY . .


# Exponieren Sie den Port 80 für den Nginx-Server
EXPOSE 80
