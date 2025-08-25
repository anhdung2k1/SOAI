import React, { useEffect, useState } from "react";
import {
  listCVsByPosition,
  deleteCV,
  approveCV,
  updateCV,
  getCVPreviewUrl,
  getProofImages,
} from "../../api/cvApi";
import { FaTrash, FaPen, FaEye } from "react-icons/fa";
import "../../css/AdminCVList.css";
import { API_HOST } from "../../constants/constants";

const AdminCVList = ({ actionsEnabled = true }) => {
  const [cvs, setCVs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCV, setSelectedCV] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCV, setEditCV] = useState(null);
  const [sortByScore, setSortByScore] = useState("desc");
  const [minScore, setMinScore] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [proofs, setProofs] = useState({});
  // Justification modal state
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [justificationContent, setJustificationContent] = useState("");
  const [justificationCV, setJustificationCV] = useState(null);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async (query = "") => {
    try {
      const data = await listCVsByPosition(query);
      setCVs(data || []);

      const proofMap = {};
      for (const cv of data || []) {
        try {
          const urls = await getProofImages(cv.id);
          proofMap[cv.id] = urls;
        } catch {
          proofMap[cv.id] = [];
        }
      }
      setProofs(proofMap);
    } catch (error) {
      console.error("Failed to fetch CVs:", error);
    }
  };

  const toggleSortOrder = () => {
    setSortByScore((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleApprove = async (id) => {
    await approveCV(id);
    fetchCVs();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this CV?")) {
      await deleteCV(id);
      fetchCVs();
    }
  };

  const handleView = (cv) => {
    setSelectedCV(cv);
    setShowModal(true);
  };

  const handleEdit = (cv) => {
    setEditCV({ ...cv });
    setEditMode(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCV(editCV.id, editCV);
      setEditMode(false);
      fetchCVs();
    } catch (err) {
      console.error("Failed to update CV:", err);
    }
  };

  const handleScoreClick = (cv) => {
    setJustificationCV(cv);
    setJustificationContent(cv.justification || "");
    setShowJustificationModal(true);
  };

  const uniquePositions = [...new Set(cvs.map((cv) => cv.matched_position).filter(Boolean))];

  const filteredCVs = cvs
    .filter((cv) => {
      try {
        const regex = new RegExp(search, "i");
        const matchesName = regex.test(cv.candidate_name);
        const meetsMinScore =
          minScore === "" || (cv.matched_score ?? 0) >= parseFloat(minScore);
        const matchesPosition =
          !positionFilter || cv.matched_position === positionFilter;
        return matchesName && meetsMinScore && matchesPosition;
      } catch (err) {
        return true;
      }
    })
    .sort((a, b) => {
      const scoreA = a.matched_score ?? 0;
      const scoreB = b.matched_score ?? 0;
      return sortByScore === "asc" ? scoreA - scoreB : scoreB - scoreA;
    });

  return (
    <div className="admin-cv-table">
      <div className="admin-cv-table__header">
        <div className="admin-cv-table__header-left">
          <h2 className="admin-cv-table__title">CV List</h2>
          <p className="admin-cv-table__subtitle">
            Manage all CVs submitted to the system.
          </p>
        </div>
        <div className="admin-cv-table__header-right">
          <button
            className="admin-cv-table__approve-btn"
            style={{ marginLeft: "12px" }}
            onClick={toggleSortOrder}
          >
            Sort {sortByScore === "asc" ? "ascending ▲" : "descending ▼"}
          </button>
          <input
            type="text"
            className="admin-cv-table__search-input"
            placeholder="Search by candidate name ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="number"
            className="admin-cv-table__minscore-input"
            placeholder="Minimum Score"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
          />
          <select
            className="admin-cv-table__select-position"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            <option value="">-- All Positions --</option>
            {uniquePositions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="admin-cv-table__content">
        <thead>
          <tr>
            <th>Candidate Name</th>
            <th>Position</th>
            <th>Status</th>
            <th>Email</th>
            <th>Score</th>
            {actionsEnabled && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {filteredCVs.map((cv) => (
            <tr key={cv.id}>
              <td>{cv.candidate_name}</td>
              <td>{cv.matched_position}</td>
              <td>
                <span className={`status-badge status-${cv.status.toLowerCase()}`}>
                  {cv.status}
                </span>
              </td>
              <td>{cv.email || "N/A"}</td>
              <td>
                <span
                  className="admin-cv-table__score-link"
                  title="Click to view AI assessment"
                  onClick={() => handleScoreClick(cv)}
                >
                  {cv.matched_score ?? "N/A"}
                </span>
              </td>
              {actionsEnabled && (
                <td>
                  <div className="admin-cv-table__action-group">
                    <button className="admin-cv-table__icon-btn" onClick={() => handleView(cv)} title="View">
                      <FaEye />
                    </button>
                    <button className="admin-cv-table__icon-btn" onClick={() => handleEdit(cv)} title="Edit">
                      <FaPen />
                    </button>
                    <button className="admin-cv-table__icon-btn delete" onClick={() => handleDelete(cv.id)} title="Delete">
                      <FaTrash />
                    </button>
                    {cv.status === "Pending" && (
                      <button onClick={() => handleApprove(cv.id)} className="admin-cv-table__approve-btn">
                        Approve CV
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedCV && actionsEnabled && (
        <div className="admin-cv-modal__overlay" onClick={() => setShowModal(false)}>
          <div className="admin-cv-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-cv-modal__close" onClick={() => setShowModal(false)}>×</button>
            <h3>CV Details</h3>
            <p><strong>Name:</strong> {selectedCV.candidate_name}</p>
            <p><strong>Email:</strong> {selectedCV.email}</p>
            <p><strong>Position:</strong> {selectedCV.matched_position}</p>
            <p><strong>Status:</strong> {
              selectedCV.status === "Accepted" ? "Accepted" :
              selectedCV.status === "Rejected" ? "Rejected" : "Pending"
            }</p>
            <p><strong>Score:</strong> {selectedCV.matched_score ?? "N/A"}</p>
            <div className="admin-cv-preview__iframe-container" style={{ marginTop: "1rem" }}>
              <iframe
                src={getCVPreviewUrl(selectedCV.id)}
                title="CV Preview"
                width="100%"
                height="600px"
                style={{ border: "1px solid #ccc" }}
              />
            </div>
            {proofs[selectedCV.id]?.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <h4>Uploaded Proofs</h4>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {proofs[selectedCV.id].map((url, index) => (
                    <img
                      key={index}
                      src={`${API_HOST}${url}`}
                      alt={`proof-${selectedCV.id}-${index}`}
                      style={{
                        width: "120px",
                        height: "auto",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {editMode && editCV && actionsEnabled && (
        <div className="admin-cv-modal__overlay" onClick={() => setEditMode(false)}>
          <div className="admin-cv-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-cv-modal__close" onClick={() => setEditMode(false)}>×</button>
            <h3>Edit CV</h3>
            <form onSubmit={handleEditSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  value={editCV.candidate_name}
                  onChange={(e) => setEditCV({ ...editCV, candidate_name: e.target.value })}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={editCV.email}
                  onChange={(e) => setEditCV({ ...editCV, email: e.target.value })}
                />
              </label>
              <label>
                Score:
                <input
                  type="number"
                  value={editCV.matched_score}
                  onChange={(e) => setEditCV({ ...editCV, matched_score: parseFloat(e.target.value) })}
                />
              </label>
              <label>
                Position:
                <input
                  type="text"
                  value={editCV.matched_position}
                  onChange={(e) => setEditCV({ ...editCV, matched_position: e.target.value })}
                />
              </label>
              <label>
                Status:
                <select
                  value={editCV.status}
                  onChange={(e) => setEditCV({ ...editCV, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </label>
              <div style={{ marginTop: "12px" }}>
                <button type="submit" className="admin-cv-table__approve-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Justification Modal */}
      {showJustificationModal && (
        <div className="admin-cv-modal__overlay" onClick={() => setShowJustificationModal(false)}>
          <div
            className="admin-cv-modal__content admin-cv-modal__justification-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 540, minWidth: 300 }}
          >
            <button
              className="admin-cv-modal__close"
              onClick={() => setShowJustificationModal(false)}
            >
              ×
            </button>
            <h3>CV Assessment</h3>
            <div className="admin-cv-modal__justification">
              {justificationContent
                ? justificationContent.split("\n").map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))
                : <span className="admin-cv-table__justification-missing">No assessment available</span>
              }
            </div>
            <div style={{marginTop: 6, color: "#6c757d", fontSize: ".97em"}}>
              <b>Name:</b> {justificationCV?.candidate_name} &nbsp;|&nbsp;
              <b>Position:</b> {justificationCV?.matched_position}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCVList;