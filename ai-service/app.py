from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import requests
import json

app = Flask(__name__)
CORS(app)

# Verbindung zur MongoDB
client = MongoClient("mongodb://db:27017")
db = client.pdf_database  # Datenbank
pdf_collection = db.pdfs  # Collection für PDF-Daten

OLLAMA_URL = 'http://ai-service:11434'  # URL des Ollama-Dienstes

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    question = data.get('question', '')  # Frage aus Anfrage
    file_id = data.get('file_id', '')  # file_id aus Anfrage

    if not file_id:
        return jsonify({'response': 'No file ID provided'}), 400

    try:
        pdf_data = pdf_collection.find_one({"_id": file_id})  # Suche direkt mit `file_id` als String
    except Exception as e:
        print(f"Error retrieving PDF with ID {file_id}: {e}")
        return jsonify({'response': f'Error retrieving PDF: {str(e)}'}), 500

    if not pdf_data:
        print(f"No data found for ID: {file_id}")
        return jsonify({'response': 'PDF text not found in database'}), 404

    pdf_text = pdf_data.get('text', '')  # Text aus PDF-Daten abrufen
    if not pdf_text:
        print(f"No text found in PDF with ID: {file_id}")
        return jsonify({'response': 'PDF text is empty'}), 404

    if not question:
        return jsonify({'response': 'No question provided'}), 400

    try:
        response = requests.post(f'{OLLAMA_URL}/api/generate', json={
            'model': 'gemma2:2b',
            'prompt': f"Based on the document, please answer the following question:\n\n{pdf_text}\n\nQuestion: {question}"
        }, stream=True)

        response.raise_for_status()

        full_response = ""
        for chunk in response.iter_lines():
            if chunk:
                try:
                    json_chunk = json.loads(chunk.decode('utf-8'))
                    if 'response' in json_chunk:
                        full_response += json_chunk['response']
                except json.JSONDecodeError:
                    continue

        return jsonify({'response': full_response})

    except requests.exceptions.RequestException as e:
        print(f"Error contacting OLLAMA service: {e}")
        return jsonify({'response': f"Error contacting OLLAMA service: {str(e)}"}), 500

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    file_id = data.get('file_id', '')  # Erwartet `file_id`

    if not file_id:
        return jsonify({'error': 'No file ID provided'}), 400

    try:
        pdf_data = pdf_collection.find_one({"_id": file_id})
    except Exception as e:
        return jsonify({'error': f'Error retrieving PDF data: {str(e)}'}), 500

    if not pdf_data:
        return jsonify({'error': 'PDF text not found in database'}), 404

    pdf_text = pdf_data.get('text', '')

    summary_text = ""
    try:
        response = requests.post(f'{OLLAMA_URL}/api/generate', json={
            'model': 'gemma2:2b',
            'prompt': f"Summarize the following text:\n\n{pdf_text}"
        }, stream=True)
        response.raise_for_status()

        for chunk in response.iter_lines():
            if chunk:
                try:
                    json_chunk = json.loads(chunk.decode('utf-8'))
                    if 'response' in json_chunk:
                        summary_text += json_chunk['response']
                except json.JSONDecodeError:
                    continue
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'response': summary_text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
