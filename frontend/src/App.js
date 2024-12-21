import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Slider from 'react-slider';
import './App.css';
import Chat from './components/Chat';
import PdfViewer from './components/PdfViewer';

function App() {
    const [fileId, setFileId] = useState(null);
    const [chatHistory, setChatHistory] = useState([]); // Neuer Zustand für den Chat-Verlauf
    const [sliderValue, setSliderValue] = useState(75);
    const [conversionType, setConversionType] = useState('text');

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles[0].type !== 'application/pdf') {
            alert('Bitte laden Sie eine PDF-Datei hoch.');
            return;
        }

        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);

        // PDF hochladen und fileId speichern
        fetch('http://localhost:5002/upload', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.file_id) {
                    setFileId(data.file_id);
                    setChatHistory([]); // Zurücksetzen des Chats nach neuer Datei
                } else {
                    console.error('Error uploading PDF:', data.error || 'Unbekannter Fehler');
                }
            })
            .catch((error) => console.error('Error uploading PDF:', error));
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleDeletePdf = () => {
        setFileId(null);
        setChatHistory([]); // Leert den Chat-Verlauf
    };    

    const handleConvertPdf = async () => {
        if (!fileId || !conversionType) return;

        try {
            const response = await fetch('http://localhost:5003/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_id: fileId, conversion_type: conversionType }),
            });

            if (!response.ok) {
                console.error('Error converting PDF:', response.statusText);
                return;
            }

            const filename = `converted_file.${getExtension(conversionType)}`;
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error converting PDF:', error);
        }
    };

    const getExtension = (conversionType) => {
        switch (conversionType) {
            case 'text':
                return 'txt';
            case 'word':
                return 'docx';
            case 'html':
                return 'html';
            default:
                return '';
        }
    };

    return (
        <div className="app-container">
            <div className="main-content">
                <div className="pdf-area" style={{ width: `${sliderValue}%`, flexGrow: 1 }}>
                    {!fileId && (
                        <div {...getRootProps()} className="dropzone" style={{ height: '100%' }}>
                            <input {...getInputProps()} />
                            <p>Ziehe hier deine PDF-Datei oder klicke, um sie auszuwählen</p>
                        </div>
                    )}
                    {fileId && (
                        <>
                            <PdfViewer fileId={fileId} />
                            <button onClick={handleDeletePdf} className="delete-button">PDF Löschen</button>
                            <select
                                value={conversionType}
                                onChange={(e) => setConversionType(e.target.value)}
                                className="convert-select"
                            >
                                <option value="text">In Text konvertieren</option>
                                <option value="word">In Word konvertieren</option>
                                <option value="html">In HTML konvertieren</option>
                            </select>
                            <button onClick={handleConvertPdf} className="convert-button">PDF Konvertieren</button>
                        </>
                    )}
                </div>
                <div className="chat-area" style={{ width: `${100 - sliderValue}%` }}>
                    <Slider value={sliderValue} onChange={setSliderValue} />
                    <Chat fileId={fileId} chatHistory={chatHistory} setChatHistory={setChatHistory} />
                </div>
            </div>
        </div>
    );
}

export default App;
