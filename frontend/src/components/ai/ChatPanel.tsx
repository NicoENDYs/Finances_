import { useState } from 'react';
import { aiApi } from '../../api';
import './ChatPanel.css';

interface Message {
    text: string;
    isUser: boolean;
}

const suggestions = [
    '¿Cuánto gasté en Starbucks?',
    '¿Cuál es mi tasa de ahorro?',
    '¿Cuánto llevo gastado este mes?',
];

export default function ChatPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { text: '¡Hola! 👋 Soy Aurora AI, tu asistente financiero. Pregúntame lo que quieras.', isUser: false },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;
        const userMsg = text.trim();
        setInput('');
        setMessages((prev) => [...prev, { text: userMsg, isUser: true }]);
        setLoading(true);

        try {
            const { data } = await aiApi.chat(userMsg);
            setMessages((prev) => [...prev, { text: data.response, isUser: false }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { text: 'Lo siento, hubo un error al procesar tu pregunta. Verifica tu configuración de IA.', isUser: false },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)} title="Aurora AI">
                <i className={isOpen ? 'fas fa-times' : 'fas fa-comments'} />
            </button>
            {isOpen && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <span className="chat-dot" />
                        Aurora AI
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.isUser ? 'user' : 'bot'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-msg bot">
                                <span className="typing">Pensando...</span>
                            </div>
                        )}
                    </div>
                    <div className="chat-suggestions">
                        {messages.length <= 1 &&
                            suggestions.map((s, i) => (
                                <button key={i} onClick={() => sendMessage(s)}>{s}</button>
                            ))}
                    </div>
                    <div className="chat-input-area">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                            placeholder="Pregúntale a Aurora..."
                        />
                        <button onClick={() => sendMessage(input)}>
                            <i className="fas fa-paper-plane" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
