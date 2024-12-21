import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// PDF.js Worker-URL setzen
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

const PdfViewer = ({ fileId }) => {
    const [pdf, setPdf] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const canvasRef = useRef(null);
    const renderTaskRef = useRef(null);

    useEffect(() => {
        const loadPdf = async () => {
            if (fileId) {
                try {
                    // PDF über die file_id vom Backend abrufen
                    const response = await axios.get(`http://localhost:5002/pdf/${fileId}`, {
                        responseType: 'blob',
                    });
                    const fileUrl = URL.createObjectURL(response.data);
                    const loadingTask = pdfjsLib.getDocument(fileUrl);

                    const loadedPdf = await loadingTask.promise;
                    setPdf(loadedPdf);
                    setTotalPages(loadedPdf.numPages);
                    renderPage(loadedPdf, 1);
                } catch (error) {
                    console.error('Error loading PDF:', error);
                }
            }
        };

        loadPdf();

        return () => {
            setPdf(null);
            setCurrentPage(1);
            setTotalPages(0);
        };
    }, [fileId]);

    const renderPage = async (loadedPdf, pageNum) => {
        if (renderTaskRef.current) {
            await renderTaskRef.current.cancel();
            renderTaskRef.current = null;
        }

        try {
            const page = await loadedPdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            renderTaskRef.current = page.render(renderContext);
            await renderTaskRef.current.promise;
            renderTaskRef.current = null;
        } catch (error) {
            if (error.name !== 'RenderingCancelledException') {
                console.error('Error rendering page:', error);
            }
        }
    };

    const goToPage = (pageNum) => {
        if (pdf && pageNum >= 1 && pageNum <= totalPages) {
            setCurrentPage(pageNum);
            renderPage(pdf, pageNum);
        }
    };

    // Funktion zur Konvertierung und Download der PDF
    const handleConvert = async (conversionType) => {
        try {
            const response = await axios.post(
                'http://localhost:5003/convert',
                { file_id: fileId, conversion_type: conversionType },
                { responseType: 'blob' }
            );

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `converted_file.${conversionType}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error converting file:', error);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '10px', position: 'relative' }}>
            {pdf ? (
                <>
                    <canvas ref={canvasRef} style={{ border: '3px solid #ddd', width: '70%', maxWidth: '700px', height: 'auto' }} />
                    <div style={{ marginTop: '10px', fontSize: '0.5em' }}>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            style={{
                                padding: '3px 6px',
                                fontSize: '0.6em',
                                marginRight: '3px',
                                cursor: 'pointer',
                            }}
                        >
                            Zurück
                        </button>
                        <span style={{ margin: '0 8px' }}>Seite {currentPage} von {totalPages}</span>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            style={{
                                padding: '3px 6px',
                                fontSize: '0.6em',
                                marginLeft: '3px',
                                cursor: 'pointer',
                            }}
                        >
                            Weiter
                        </button>
                    </div>
                </>
            ) : (
                <p style={{ fontSize: '0.6em' }}>Bitte eine PDF-Datei hochladen, um sie anzuzeigen.</p>
            )}
        </div>
    );
};

export default PdfViewer;
