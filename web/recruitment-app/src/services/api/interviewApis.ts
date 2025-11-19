import { API_BASE_URL } from '../../shared/constants/baseUrls';
import { HTTP_ERROR_CODE } from '../../shared/constants/httpCodes';
import { getToken } from '../../shared/helpers/authUtils';
import type { Interview } from '../../shared/types/adminTypes';

/**
 * Helper for generating authorization headers.
 */
const authHeaders = (isJson = true) => ({
    ...(isJson && { 'Content-Type': 'application/json' }),
    Authorization: `Bearer ${getToken()}`,
});

/**
 * Get all interview sessions (admin only).
 * @param {string} interviewDate - Interview date
 * @param {string} candidateName - Candidate name
 * @returns {Promise<Array>}
 */
export const getInterviews = async (interviewDate: string = '', candidateName: string = ''): Promise<Interview[]> => {
    const query = [];
    if (interviewDate) {
        query.push(`interview_date=${encodeURIComponent(interviewDate)}`);
    }
    if (candidateName) {
        query.push(`candidate_name=${encodeURIComponent(candidateName)}`);
    }
    const queryString = query.length > 0 ? `?${query.join('&')}` : '';
    const url = `${API_BASE_URL}/recruitment/interviews${queryString}`;

    try {
        const response = await fetch(url, { headers: authHeaders(false) });
        if (!response.ok) {
            const message = HTTP_ERROR_CODE[response.status] || 'An unexpected error occurred.';
            throw new Error(message);
        }
        return await response.json();
    } catch (err) {
        console.error(`[DEBUG getInterviews] Failed to parse JSON: ${err}`);
        return [];
    }
};
