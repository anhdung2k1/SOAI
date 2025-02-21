import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ChatbotPage from "./pages/ChatbotPage";
import CameraPage from "./pages/CameraPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/camera" element={<CameraPage />} />
      </Routes>
    </Router>
  );
};

export default App;
