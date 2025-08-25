import React, { useEffect, useState } from "react";
import TopHeader from "./TopHeader";
import SmartRecruitmentLogo from "../../assets/images/smart-recruitment-admin-logo.png";
import { FaMapMarkerAlt, FaCalendarAlt, FaUpload } from "react-icons/fa";
import {
  getOwnCVApplied,
  uploadProofImages,
  getProofImages,
} from "../../api/cvApi";
import "../../css/CandidateApplication.css";
import { API_HOST } from "../../constants/constants";

const CandidateApplication = () => {
  const [cvList, setCvList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofImages, setProofImages] = useState({});

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const data = await getOwnCVApplied();
        setCvList(data || []);

        const proofMap = {};
        for (const cv of data) {
          try {
            const urls = await getProofImages(cv.id);
            proofMap[cv.id] = urls;
          } catch {
            proofMap[cv.id] = [];
          }
        }
        setProofImages(proofMap);
      } catch (err) {
        console.error("Error loading CVs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, []);

  const handleUpload = async (e, cvId) => {
    const files = e.target.files;
    if (!files?.length) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      await uploadProofImages(cvId, formData);
      const updated = await getProofImages(cvId);
      setProofImages((prev) => ({ ...prev, [cvId]: updated }));
    } catch (err) {
      console.error("Failed to upload proof images:", err);
    }
  };

  return (
    <>
      <TopHeader />
      <div className="cv-container">
        {loading ? (
          <p className="cv-loading">Loading...</p>
        ) : cvList.length === 0 ? (
          <p className="cv-empty">You have not submitted any applications.</p>
        ) : (
          <div className="cv-card-list">
            {cvList.map((cv) => (
              <div key={cv.id} className="cv-card">
                <div className="cv-card-grid">
                  {/* Left section */}
                  <div className="cv-card-left">
                    <img
                      src={SmartRecruitmentLogo}
                      alt="Logo"
                      className="cv-logo"
                    />
                    <div className="cv-info">
                      <h3 className="cv-position">{cv.matched_position}</h3>
                      <p className="cv-sub">Recruitment • Candidate • N/A</p>
                      <p className="cv-location">
                        <FaMapMarkerAlt className="cv-icon" />
                        Candidate Location • Ho Chi Minh City
                      </p>
                      <p className="cv-label">
                        Candidate Name: <span>{cv.candidate_name}</span>
                      </p>
                      <p className="cv-label">
                        Email: <span>{cv.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right section */}
                  <div className="cv-card-right">
                    <p className="cv-date-text">
                      <FaCalendarAlt className="cv-icon" />
                      {new Date(cv.datetime).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <div className={`cv-badge ${cv.status.toLowerCase()}`}>
                      {cv.status}
                    </div>
                  </div>
                </div>

                {/* Proof Upload */}
                <div className="cv-upload-section">
                  <label htmlFor={`proof-upload-${cv.id}`} className="upload-label">
                    <FaUpload className="cv-icon" />
                    Upload Proof
                  </label>
                  <input
                    id={`proof-upload-${cv.id}`}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleUpload(e, cv.id)}
                  />
                  {proofImages[cv.id]?.length > 0 && (
                    <div className="upload-preview">
                      {proofImages[cv.id].map((url, index) => (
                        <img
                          key={index}
                          src={`${API_HOST}${url}`}
                          alt={`proof-${cv.id}-${index}`}
                          className="preview-image"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CandidateApplication;
