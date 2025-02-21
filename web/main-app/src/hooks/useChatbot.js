import { useState } from "react";
import { sendMessageToAPI } from "../api/chatbotApi";

const useChatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! How can I assist you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama3.2"); // Default model
  const [collectionName, setCollectionName] = useState(""); // Default is empty

  const sendMessage = async (userMessage) => {
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setLoading(true);

    // Add a placeholder message with a loading indicator
    const loadingMessage = { type: "bot", text: "", isLoading: true };
    setMessages((prev) => [...prev, loadingMessage]);

    const response = await sendMessageToAPI(userMessage, selectedModel, collectionName);
    setLoading(false);

    // Replace loading message with actual response
    setMessages((prev) => {
      const updatedMessages = [...prev];
      updatedMessages[updatedMessages.length - 1] = { type: "bot", text: response.reply };
      return updatedMessages;
    });
  };

  return { messages, sendMessage, loading, selectedModel, setSelectedModel, collectionName, setCollectionName };
};

export default useChatbot;
