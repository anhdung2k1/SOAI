#!/usr/bin/env python3

import os
import unittest
import httpx
import logging
import inspect
from datetime import datetime

AUTH_URL = "http://localhost:9090/api/v1/authentications"
BASE_URL = "http://localhost:8003/api/v1/recruitment"
TIMEOUT = 30.0

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JD_FILE_PATH = os.path.join(BASE_DIR, "test_data", "jd_sample.json")
CV_FILE_PATH = os.path.join(BASE_DIR, "test_data", "sampleCV.pdf")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestRecruitmentAPI")


class TestRecruitmentAPI(unittest.TestCase):
    admin_token = None
    user_token = None

    @classmethod
    def setUpClass(cls):
        cls.admin_token = cls.extract_token("admin", "Admin@123", role="ADMIN")
        cls.user_token = cls.extract_token("user1", "User@123", role="USER")

    @staticmethod
    def extract_token(username, password, role=None):
        payload = {"userName": username, "password": password}
        if role:
            payload["role"] = role
            url = f"{AUTH_URL}/signup"
        else:
            url = f"{AUTH_URL}/signin"

        response = httpx.post(url, json=payload, timeout=TIMEOUT)
        if response.status_code == 403 and role:
            url = f"{AUTH_URL}/signin"
            payload.pop("role", None)
            response = httpx.post(url, json=payload, timeout=TIMEOUT)

        response.raise_for_status()
        token = response.json().get("token")
        logger.info(f"token: {token}")
        assert token, f"Failed to get token for {username}"
        logger.info(f"Token acquired for {username}")
        return token

    def get_headers(self, token):
        return {"Authorization": f"Bearer {token}"}

    def test_flow1_full_admin_process(self):
        '''
        Flow 1 (full): Upload JD -> Upload CV -> Get CV -> Approve CV -> Schedule Interview -> Accept Interview
        '''
        logger.info("TEST: test_flow1_full_admin_process")

        # Step 1: Upload JD
        with open(JD_FILE_PATH, "rb") as f:
            files = {"file": ("jd_sample.json", f, "application/json")}
            response = httpx.post(
                f"{BASE_URL}/upload-jd",
                files=files,
                headers=self.get_headers(self.admin_token),
                timeout=TIMEOUT
            )
        logger.info(f"[Upload JD] Status: {response.status_code}, Response: {response.json()}")
        self.assertEqual(response.status_code, 200)
        self.assertIn("JD uploaded", response.json()["message"])

        # Step 2: Upload CV
        with open(CV_FILE_PATH, "rb") as f:
            files = {
                "file": ("sampleCV.pdf", f, "application/pdf"),
                "override_email": (None, "kudung053@gmail.com"),
                "position_applied_for": (None, "Frontend Developer")
            }
            response = httpx.post(
                f"{BASE_URL}/upload-cv",
                files=files,
                headers=self.get_headers(self.admin_token),
                timeout=TIMEOUT
            )
        logger.info(f"[Upload CV] Status: {response.status_code}, Response: {response.json()}")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Pending", response.json()["message"])

        # Step 3: Get pending CV
        response = httpx.get(
            f"{BASE_URL}/pending-cv-list",
            params={"candidate_name": "Bui Thanh Tra"},
            headers=self.get_headers(self.admin_token),
            timeout=TIMEOUT
        )
        logger.info(f"[Get Pending CV] Status: {response.status_code}, Response: {response.json()}")
        self.assertEqual(response.status_code, 200)
        pending_cv = response.json()
        # The candidate has been approved or empty -> Should skip it.
        # TODO: Need to delete if it existing => then get again
        if not pending_cv:
            logger.warning("No pending CV found — skipping rest of test.")
            self.skipTest("No pending CV found — CV upload may have failed or JD didn't match.")
        candidate_id = pending_cv[0]["id"]

        # Step 4: Approve CV
        response = httpx.post(
            f"{BASE_URL}/approve-cv",
            data={"candidate_id": str(candidate_id)},
            headers=self.get_headers(self.admin_token),
            timeout=TIMEOUT
        )
        logger.info(f"[Approve CV] Status: {response.status_code}, Response: {response.json()}")
        self.assertIn(response.status_code, [200, 400])
        self.assertTrue("Accepted" in response.json()["message"] or "already" in response.json()["message"])

        # Step 5: Schedule Interview
        interview_payload = {
            "candidate_name": "Bui Thanh Tra",
            "interviewer_name": "Le Van B",
            "interview_datetime": datetime.now().replace(microsecond=0).isoformat()
        }
        response = httpx.post(
            f"{BASE_URL}/schedule-interview",
            json=interview_payload,
            headers=self.get_headers(self.admin_token),
            timeout=TIMEOUT
        )
        logger.info(f"[Schedule Interview] Status: {response.status_code}, Response: {response.json()}")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Interview scheduled", response.json()["message"])

        # Step 6: Accept Interview
        response = httpx.get(
            f"{BASE_URL}/interview-list",
            params={"candidate_name": "Bui Thanh Tra"},
            headers=self.get_headers(self.admin_token),
            timeout=TIMEOUT
        )
        interviews = response.json()
        if not interviews:
            self.fail("No interview found to accept.")
        interview_id = interviews[0]["id"]

        accept_payload = {"candidate_id": interview_id}
        response = httpx.put(
            f"{BASE_URL}/accept-interview",
            json=accept_payload,
            headers=self.get_headers(self.admin_token),
            timeout=TIMEOUT
        )
        logger.info(f"[Accept Interview] Status: {response.status_code}, Response: {response.json()}")
        self.assertEqual(response.status_code, 200)
        self.assertIn("accepted", response.json()["message"].lower())

        logger.info("TEST test_flow1_full_admin_process: OK")

    def test_flow2_forbidden_approve_cv_with_user_role(self):
        '''
        Flow 2 - User tries to approve a CV (should be denied due to insufficient permissions)
        '''
        logger.info("TEST: " + inspect.currentframe().f_code.co_name)

        # Get pending CV list as admin
        response = httpx.get(
            f"{BASE_URL}/pending-cv-list",
            params={"candidate_name": "Bui Thanh Tra"},
            headers=self.get_headers(self.admin_token),
            timeout=TIMEOUT
        )
        pending_cv = response.json()
        if not pending_cv:
            logger.warning("[Approve as USER] Skipped — No pending CV found.")
            self.skipTest("No pending CV found.")

        candidate_id = pending_cv[0]["id"]

        # Attempt to approve CV as user (should be forbidden)
        response = httpx.post(
            f"{BASE_URL}/approve-cv",
            data={"candidate_id": str(candidate_id)},
            headers=self.get_headers(self.user_token),
            timeout=TIMEOUT
        )
        logger.info(f"[Approve CV as USER] Status: {response.status_code}, Response: {response.json()}")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json().get("detail"), "Insufficient permission")
        logger.info("TEST " + inspect.currentframe().f_code.co_name + ": OK")


if __name__ == "__main__":
    unittest.main()