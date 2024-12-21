# backend-pdf-convert/Dockerfile

# Verwenden Sie das offizielle Python-Image
FROM python:3.9

# Arbeitsverzeichnis setzen
WORKDIR /app

# Kopieren Sie die notwendigen Dateien
COPY . /app

# Installieren Sie die Abhängigkeiten
RUN pip install --no-cache-dir -r requirements.txt

# Starten Sie die Flask-App
CMD ["python", "app.py"]
