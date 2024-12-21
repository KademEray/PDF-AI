# backend-ollama/Dockerfile

# Verwenden Sie das offizielle Python-Image
FROM python:3.9

# Arbeitsverzeichnis setzen
WORKDIR /app

# Kopieren Sie die notwendigen Dateien
COPY . /app

# Installieren Sie die Abhängigkeiten
RUN pip install --no-cache-dir -r requirements.txt
RUN pip uninstall -y bson pymongo
RUN pip install pymongo

# Starten Sie die Flask-App
CMD ["python", "app.py"]
