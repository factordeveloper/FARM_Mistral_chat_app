import React, { useState } from 'react';
import './Chatbot.css';


function Chatbot() {
    const [prompt, setPrompt] = useState(''); // Input del usuario
    const [response, setResponse] = useState(''); // Respuesta del chatbot
    const [history, setHistory] = useState([]); // Historial de chat

    // Maneja el envío de la pregunta al backend
    const handleSend = async () => {
        if (prompt.trim() === '') return alert('Please enter a prompt.');

        try {
            const res = await fetch('http://localhost:8000/ask', { // Cambia la URL si es necesario
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }), // Envía el prompt al backend
            });

            const data = await res.json(); // Obtiene la respuesta
            if (res.ok) {
                setResponse(data.response); // Actualiza la respuesta en pantalla
                setHistory([...history, { prompt, response: data.response }]); // Actualiza el historial
                setPrompt(''); // Limpia el input
            } else {
                console.error(data.detail);
                alert('Error: ' + data.detail);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to fetch response');
        }
    };

    return (
        <div className="app-container">
            <h1>Voice-powered Mistral Chatbot</h1>
            
            <div className="input-container">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Or type your question here..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
            
            <div className="response-container">
                <p><strong>Response:</strong> {response}</p>
            </div>

            <h2>Chat History</h2>
            <ul>
                {history.map((msg, index) => (
                    <li key={index}>
                        <strong>Prompt:</strong> {msg.prompt} <br/>
                        <strong>Response:</strong> {msg.response}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Chatbot;
