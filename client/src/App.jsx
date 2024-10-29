import React, { useState, useRef } from 'react';
import './App.css';

function App() {
    const [recordedText, setRecordedText] = useState('');
    const [responseText, setResponseText] = useState('');
    const promptInput = useRef(null);

    // Iniciar Speech Recognition
    const startRecording = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        
        recognition.onstart = () => console.log('Voice recognition started. Speak into the microphone.');
        
        recognition.onspeechend = () => recognition.stop();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setRecordedText(transcript);
            promptInput.current.value = transcript;
        };

        recognition.onerror = (event) => console.error('Speech recognition error detected:', event.error);
        
        recognition.start();
    };

    // Enviar el prompt al backend
    const sendPrompt = async () => {
        const promptText = promptInput.current.value;

        if (!promptText.trim()) {
            alert("Please enter or record a prompt.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/prompt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt: promptText })
            });
            const data = await response.json();
            setResponseText(data.response);

        } catch (error) {
            console.error('Error:', error);
            setResponseText('Error connecting to the server.');
        }
    };

    // Text to Speech
    const speakResponse = () => {
        if (responseText) {
            const speech = new SpeechSynthesisUtterance(responseText);
            window.speechSynthesis.speak(speech);
        } else {
            alert("No response to speak.");
        }
    };

    return (
        <div className="app-container">
            <h1>Voice-powered Mistral Chatbot</h1>

            <button onClick={startRecording}>Start Recording</button>
            <p>{recordedText}</p>

            <div className="input-container">
                <textarea ref={promptInput} placeholder="Or type your question here..." />
                <button onClick={sendPrompt}>Send</button>
            </div>

            <div className="response-container">
                <p>{responseText}</p>
            </div>

            <button onClick={speakResponse}>Speak Response</button>
        </div>
    );
}

export default App;
