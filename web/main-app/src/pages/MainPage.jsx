import { Link } from "react-router-dom";

const MainPage = () => {
  return (
    <div className="page-container">
      <h1>Welcome to SOAI</h1>
      <p>Choose a page to explore:</p>
      <nav>
        <ul>
          <li><Link to="/chatbot">Chatbot</Link></li>
          <li><Link to="/camera">Camera Page</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default MainPage;
