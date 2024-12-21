from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
import io
import fitz  # PyMuPDF
import uuid

app = Flask(__name__)
CORS(app)

# MongoDB-Verbindung
client = MongoClient("mongodb://db:27017")
db = client.pdf_database  # Datenbank
pdf_collection = db.pdfs  # Collection für PDF-Daten

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_bytes):
    """Extrahiert Text aus einer PDF-Datei (Bytes)."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Datei als Bytes lesen
        file_bytes = file.read()

        # Text aus der PDF extrahieren
        extracted_text = extract_text_from_pdf(file_bytes)

        # Generiere eine UUID als Datei-ID
        file_id = str(uuid.uuid4())
        
        # Speichern der Datei und des Textes in MongoDB
        pdf_collection.insert_one({
            "_id": file_id,
            "filename": file.filename,
            "file_data": file_bytes,
            "text": extracted_text
        })

        return jsonify({'message': 'PDF uploaded and text extracted successfully.', 'file_id': file_id, 'text': extracted_text})
    else:
        return jsonify({'error': 'Invalid file format. Only PDF allowed'}), 400

@app.route('/pdf/<file_id>', methods=['GET'])
def get_pdf(file_id):
    """PDF-Datei aus MongoDB abrufen."""
    pdf_data = pdf_collection.find_one({"_id": file_id})
    if not pdf_data:
        return jsonify({'error': 'PDF not found'}), 404

    return send_file(
        io.BytesIO(pdf_data["file_data"]),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=pdf_data['filename']
    )

@app.route('/pdf-text/<file_id>', methods=['GET'])
def get_pdf_text(file_id):
    """Text der PDF aus MongoDB abrufen."""
    pdf_data = pdf_collection.find_one({"_id": file_id})
    if not pdf_data:
        return jsonify({'error': 'PDF not found'}), 404

    return jsonify({'file_id': file_id, 'filename': pdf_data['filename'], 'text': pdf_data['text']})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
