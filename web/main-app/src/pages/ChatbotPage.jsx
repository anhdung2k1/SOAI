import Chatbot from "../components/Chatbot";
import { Link } from "react-router-dom";

const ChatbotPage = () => {
  return (
    <div className="page-container">
      <h1>Chatbot</h1>
      <Chatbot />
      <Link to="/">Go Back to Main</Link>
    </div>
  );
};

export default ChatbotPage;
