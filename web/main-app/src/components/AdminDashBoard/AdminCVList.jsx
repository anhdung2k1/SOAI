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
      console.error("Không thể tải danh sách CV:", error);
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
    if (window.confirm("Bạn có chắc muốn xóa CV này?")) {
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
      console.error("Cập nhật CV thất bại:", err);
    }
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
          <h2 className="admin-cv-table__title">Danh sách hồ sơ</h2>
          <p className="admin-cv-table__subtitle">
            Quản lý tất cả CV đã nộp vào hệ thống.
          </p>
        </div>
        <div className="admin-cv-table__header-right">
          <button
            className="admin-cv-table__approve-btn"
            style={{ marginLeft: "12px" }}
            onClick={toggleSortOrder}
          >
            Sắp xếp {sortByScore === "asc" ? "tăng ▲" : "giảm ▼"}
          </button>
          <input
            type="text"
            className="admin-cv-table__search-input"
            placeholder="Tìm theo tên học sinh ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="number"
            className="admin-cv-table__minscore-input"
            placeholder="Điểm tối thiểu"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
          />
          <select
            className="admin-cv-table__select-position"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            <option value="">-- Tất cả chuyên đề --</option>
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
            <th>Họ tên</th>
            <th>Vị trí ứng tuyển</th>
            <th>Trạng thái</th>
            <th>Email</th>
            <th>Điểm</th>
            {actionsEnabled && <th>Hành động</th>}
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
              <td>{cv.matched_score ?? "N/A"}</td>
              {actionsEnabled && (
                <td>
                  <div className="admin-cv-table__action-group">
                    <button className="admin-cv-table__icon-btn" onClick={() => handleView(cv)} title="Xem">
                      <FaEye />
                    </button>
                    <button className="admin-cv-table__icon-btn" onClick={() => handleEdit(cv)} title="Chỉnh sửa">
                      <FaPen />
                    </button>
                    <button className="admin-cv-table__icon-btn delete" onClick={() => handleDelete(cv.id)} title="Xóa">
                      <FaTrash />
                    </button>
                    {cv.status === "Pending" && (
                      <button onClick={() => handleApprove(cv.id)} className="admin-cv-table__approve-btn">
                        Duyệt hồ sơ
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
            <h3>Chi tiết hồ sơ</h3>
            <p><strong>Họ tên:</strong> {selectedCV.candidate_name}</p>
            <p><strong>Email:</strong> {selectedCV.email}</p>
            <p><strong>Vị trí:</strong> {selectedCV.matched_position}</p>
            <p><strong>Trạng thái:</strong> {
              selectedCV.status === "Accepted" ? "Đã duyệt" :
              selectedCV.status === "Rejected" ? "Từ chối" : "Đang chờ"
            }</p>
            <p><strong>Điểm:</strong> {selectedCV.matched_score ?? "N/A"}</p>
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
                <h4>Minh chứng đã tải lên:</h4>
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
            <h3>Chỉnh sửa hồ sơ</h3>
            <form onSubmit={handleEditSubmit}>
              <label>
                Họ tên:
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
                Điểm:
                <input
                  type="number"
                  value={editCV.matched_score}
                  onChange={(e) => setEditCV({ ...editCV, matched_score: parseFloat(e.target.value) })}
                />
              </label>
              <label>
                Vị trí:
                <input
                  type="text"
                  value={editCV.matched_position}
                  onChange={(e) => setEditCV({ ...editCV, matched_position: e.target.value })}
                />
              </label>
              <label>
                Trạng thái:
                <select
                  value={editCV.status}
                  onChange={(e) => setEditCV({ ...editCV, status: e.target.value })}
                >
                  <option value="Pending">Đang chờ</option>
                  <option value="Accepted">Đã duyệt</option>
                  <option value="Rejected">Từ chối</option>
                </select>
              </label>
              <div style={{ marginTop: "12px" }}>
                <button type="submit" className="admin-cv-table__approve-btn">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCVList;
