import { API_BASE_URL } from "../constants/constants";
import { handleResponse } from "./responseHandler";
import { getToken } from "./authApi";

/**
 * Generate Authorization header with Bearer token
 * Used for all authenticated API calls
 */
const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

// ======================================================================================
//                                    CANDIDATE APIs
// ======================================================================================

/**
 * Upload a CV (candidate must be logged in).
 * @param {File} file - CV file (.pdf or other formats).
 * @param {string} position_applied_for - Target position or specialization.
 * @param {string|null} override_email - (Optional) override email.
 * @returns {Promise<Object>} Server response.
 */
export const uploadCV = async (file, position_applied_for, override_email = null) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("position_applied_for", position_applied_for);
  if (override_email) formData.append("override_email", override_email);

  const response = await fetch(`${API_BASE_URL}/recruitment/cvs/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return await handleResponse(response);
};

/**
 * Get all CVs submitted by the currently logged-in candidate.
 * @returns {Promise<Array>} List of CVs.
 */
export const getOwnCVApplied = async () => {
  const response = await fetch(`${API_BASE_URL}/recruitment/cvs/me`, {
    headers: authHeaders()
  });
  return await handleResponse(response);
};

/**
 * Get preview URL for a CV PDF file.
 * @param {string|number} cvId - CV ID.
 * @returns {string} Public preview URL.
 */
export const getCVPreviewUrl = (cvId) => {
  return `${API_BASE_URL}/recruitment/cvs/${cvId}/preview`;
};

/**
 * Upload proof images (e.g. certificates, transcripts) for a specific CV.
 * @param {number} cvId - CV ID.
 * @param {File[]} files - Array of image files.
 * @returns {Promise<Object>} Upload status.
 */
export const uploadProofImages = async (cvId, files) => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));

  const response = await fetch(`${API_BASE_URL}/recruitment/cvs/${cvId}/proofs/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData
  });
  return await handleResponse(response);
};

/**
 * Get all uploaded proof image URLs for a specific CV.
 * @param {number} cvId - CV ID.
 * @returns {Promise<Array<string>>} List of image URLs.
 */
export const getProofImages = async (cvId) => {
  const response = await fetch(`${API_BASE_URL}/recruitment/cvs/${cvId}/proofs`, {
    headers: authHeaders()
  });
  return await handleResponse(response);
};

/**
 * Get full info of a specific CV.
 * @param {string|number} cvId - CV ID.
 * @returns {Promise<Object>} CV object.
 */
export const getCVById = async (cvId) => {
  const response = await fetch(`${API_BASE_URL}/recruitment/cvs/${cvId}`, {
    headers: authHeaders()
  });
  return await handleResponse(response);
};

// ======================================================================================
//                                     ADMIN APIs
// ======================================================================================

/**
 * Approve a candidate CV (admin only).
 * @param {string|number} candidateId - Candidate ID to approve.
 * @returns {Promise<Object>} Approval status.
 */
export const approveCV = async (candidateId) => {
  const response = await fetch(`${API_BASE_URL}/recruitment/cvs/${candidateId}/approve`, {
    method: "POST",
    headers: authHeaders()
  });
  return await handleResponse(response);
};

/**
 * Get all pending CVs (admin only).
 * @param {string} [candidateName] - Optional filter by candidate name.
 * @returns {Promise<Array>} Pending CVs.
 */
export const getPendingCVs = async (candidateName = "") => {
  const query = candidateName ? `?candidate_name=${encodeURIComponent(candidateName)}` : "";
  const url = `${API_BASE_URL}/recruitment/cvs/pending${query}`;
  const response = await fetch(url, {
    headers: authHeaders()
  });
  return await handleResponse(response);
};

/**
 * Get all approved CVs (admin only).
 * @param {string} [candidateName] - Optional filter by candidate name.
 * @returns {Promise<Array>} Approved CVs.
 */
export const getApprovedCVs = async (candidateName = "") => {
  const query = candidateName ? `?candidate_name=${encodeURIComponent(candidateName)}` : "";
  const url = `${API_BASE_URL}/recruitment/cvs/approved${query}`;
  const response = await fetch(url, {
    headers: authHeaders()
  });
  return await handleResponse(response);
};

/**
 * Get all CVs matching a specific position (admin only).
 * @param {string} position - Position or specialization.
 * @returns {Promise<Array>} CVs matched to the position.
 */
export const listCVsByPosition = async (position = "") => {
  const query = position ? `?position=${encodeURIComponent(position)}` : "";
  const url = `${API_BASE_URL}/recruitment/cvs/position${query}`;
  const response = await fetch(url, {
    headers: authHeaders()
  });
  return await handleResponse(response);
};

/**
 * Update a CV (admin only).
 * @param {string|number} cvId - CV ID.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object>} Updated CV.
 */
export const updateCV = async (cvId, updateData) => {
  const response = await fetch(`${API_BASE_URL}/recruitment/cvs/${cvId}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updateData)
  });
  return await handleResponse(response);
};

/**
 * Delete a CV (admin only).
 * @param {string|number} cvId - CV ID to delete.
 * @returns {Promise<Object>} Deletion status.
 */
export const deleteCV = async (cvId) => {
  const response = await fetch(`${API_BASE_URL}/recruitment/cvs/${cvId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return await handleResponse(response);
};
