
import React, { useState, useEffect, useRef } from 'react';
import { ChatbotService } from '../services/ChatbotService';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ... (Icons remain the same)

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);


const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
    const [chatbotService, setChatbotService] = useState<ChatbotService | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversation, setConversation] = useState<Array<{sender: 'user' | 'bot', text: string}>>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [conversation]);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            ChatbotService.create().then(service => {
                setChatbotService(service);
                setConversation([{ sender: 'bot', text: 'Hola, soy tu asistente de auxilio. ¿Cómo te sientes? ¿En qué puedo ayudarte hoy?' }]);
                setIsLoading(false);
            });
        } else {
            // Reset state when closed
            setConversation([]);
            setInputValue('');
            setChatbotService(null);
        }
    }, [isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading || !chatbotService) return;

        const userMessage = { sender: 'user' as const, text: inputValue };
        setConversation(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        
        const botResponseText = await chatbotService.processUserIntent(userMessage.text);
        
        const botMessage = { sender: 'bot' as const, text: botResponseText };
        setConversation(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col text-white animate-fade-in-up"
            >
                <header className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-gray-300">Botón de Auxilio</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar chat">
                        <CloseIcon />
                    </button>
                </header>
                
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {conversation.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-green-500/50 flex-shrink-0"></div>}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-green-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isLoading && chatbotService && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-green-500/50 flex-shrink-0"></div>
                             <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-700 rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-white/10">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isLoading ? "Analizando..." : "Describe tu situación..."}
                            className="flex-grow bg-gray-800 border border-white/20 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isLoading || !chatbotService}
                        />
                        <button 
                            type="submit" 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold p-2.5 rounded-lg flex items-center justify-center transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                            disabled={isLoading || !inputValue.trim() || !chatbotService}
                        >
                            <SendIcon />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default ChatbotModal;
