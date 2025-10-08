# CV Uploads Folder

This folder stores CV files uploaded by clients during runtime.

When a client uploads a CV:
1. The file is saved here temporarily.
2. The worker reads and parses the CV.
3. Extracted data is used for further processing (e.g., AI analysis).
4. Files may be deleted after processing.

### Notes
- This folder is created automatically if it doesn’t exist.
- Add this folder to `.gitignore` (don’t commit CV files).
- Keep access restricted since CVs contain personal data.

**Path:** `./cv_uploads/`  
**Used by:** Recruitment AI Agent backend
