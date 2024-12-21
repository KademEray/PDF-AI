import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chat = ({ fileId, chatHistory, setChatHistory }) => { // chatHistory und setChatHistory als Props
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showConvertOptions, setShowConvertOptions] = useState(false);
    const messagesEndRef = useRef(null);

    const handleSendMessage = async () => {
        if (!message || isGenerating) return;

        const isSummarizeCommand = message.trim() === '/summarize';

        if (isSummarizeCommand) {
            await handleSummarize();
        } else {
            await handleAsk();
        }
    };

    const handleAsk = async () => {
        if (!fileId) {
            setChatHistory(prevHistory => [
                ...prevHistory,
                { user: message, bot: 'Keine PDF-Daten verfügbar.' }
            ]);
            return;
        }

        setIsGenerating(true);

        try {
            const response = await axios.post('http://localhost:5001/ask', {
                question: message,
                file_id: fileId
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            setChatHistory(prevHistory => [
                ...prevHistory,
                { user: message, bot: response.data.response || "Keine Antwort erhalten" }
            ]);
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSummarize = async () => {
        if (!fileId) {
            setChatHistory(prevHistory => [
                ...prevHistory,
                { user: '/summarize', bot: 'Keine PDF-Daten verfügbar.' }
            ]);
            return;
        }

        setIsGenerating(true);

        try {
            const response = await axios.post('http://localhost:5001/summarize', {
                file_id: fileId
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const summaryText = response.data.response || "Zusammenfassung fehlgeschlagen";

            setChatHistory(prevHistory => [
                ...prevHistory,
                { user: message, bot: summaryText }
            ]);
            setMessage('');
        } catch (error) {
            console.error('Error summarizing PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConvertChat = async (conversionType) => {
        try {
            const response = await axios.post('http://localhost:5003/convert-chat', {
                chat_history: chatHistory,
                conversion_type: conversionType
            }, { responseType: 'blob' });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `chat_history.${conversionType}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setShowConvertOptions(false);
        } catch (error) {
            console.error('Error converting chat:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                setMessage(message + '\n');
            } else {
                e.preventDefault();
                handleSendMessage();
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    useEffect(() => {
        if (!fileId) {
            setChatHistory([]); // Leert den Chat-Verlauf, wenn keine Datei vorhanden ist
        }
    }, [fileId, setChatHistory]);    

    return (
        <div className="chat-box" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div className="messages" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {chatHistory.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                        <strong>Du:</strong> {msg.user}<br />
                        <strong>Bot:</strong> {msg.bot}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0' }}>
                <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Schreibe deine Nachricht hier. /summarize für Zusammenfassung."
                    style={{
                        flexGrow: 1,
                        marginRight: '5px',
                        resize: 'none',
                        padding: '5px',
                        height: '40px'
                    }}
                    disabled={isGenerating}
                />
                <button 
                    onClick={handleSendMessage} 
                    style={{ borderRadius: '50%', padding: '10px', width: '40px', height: '40px' }} 
                    disabled={isGenerating}>
                    ➤
                </button>
            </div>
            <div style={{ marginTop: '10px', textAlign: 'center', width: '250px' }}>
                <button onClick={() => setShowConvertOptions(!showConvertOptions)} style={{ width: '100%' }}>Chat Speichern</button>
                {showConvertOptions && (
                    <div style={{ marginTop: '5px', width: '250px' }}>
                        <button onClick={() => handleConvertChat('text')}>Als Text speichern</button>
                        <button onClick={() => handleConvertChat('word')}>Als Word speichern</button>
                        <button onClick={() => handleConvertChat('html')}>Als HTML speichern</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
