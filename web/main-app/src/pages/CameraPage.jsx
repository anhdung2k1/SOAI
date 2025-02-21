import { Link } from "react-router-dom";

const CameraPage = () => {
return (
<div className="page-container">
    <h1>Camera Page</h1>
    <p>This is camera page.</p>
    <Link to="/">Go Back to Main</Link>
</div>
);
};

export default CameraPage;