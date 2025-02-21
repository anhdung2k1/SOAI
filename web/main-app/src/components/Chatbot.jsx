import { useState } from "react";
import useChatbot from "../hooks/useChatbot";

const Chatbot = () => {
    const { messages, sendMessage, loading, selectedModel, setSelectedModel, collectionName, setCollectionName } = useChatbot();
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input);
            setInput("");
        }
    };

    return (
        <div className="chatbot-container">
            <div className="model-selector">
                <label>Select Model:</label>
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                    <option value="llama3.2">Llama 3.2</option>
                    <option value="deepseek-r1:1.5b">Deepseek r1 1.5b</option>
                    <option value="llama3.2:1b">Llama3.2 1b</option>
                </select>
            </div>
            <div className="collection-name-input">
                <label>Collection Name:</label>
                <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="Enter collection name (optional)"
                />
            </div>
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                        {msg.isLoading ? <div className="loading-spinner"></div> : msg.text}
                    </div>
                ))}
            </div>

            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={handleSend} disabled={loading}>
                    {loading ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
