import json
from config.log_config import AppLogger
from utils.pdf_parser import extract_text_from_pdf
from agents.base_agent import BaseAgent
from agents.state import RecruitmentState

logger = AppLogger(__name__)

class CVParserAgent(BaseAgent):
    def __init__(self, llm):
        self.llm = llm

    def run(self, state: RecruitmentState) -> RecruitmentState:
        if state.stop_pipeline:
            return state

        # Extract text from uploaded CV file
        text = extract_text_from_pdf(state.cv_file_path)

        # Build multilingual prompt (for Vietnamese + English CVs)
        prompt = f"""
You are an ATS parser for high school admissions. The CV content is written in Vietnamese or English.

From the content below, extract the following fields:
- name (string)
- email (string)
- skills (list of strings): merge all subject-based academic scores and academic achievements into one flat list.

Include in `skills`:
- Academic scores in the format: "Subject: score", e.g.:
  - "Toán học: 9.5", "Ngữ văn: 8.0", "Math: 9.0", "Physics: 8.5"
- Academic awards, competitions, or scholarships, e.g.:
  - "Giải Nhất HSG Toán cấp thành phố", "Học bổng toàn phần Vinschool"
  - "First Prize in Physics Olympiad", "Bronze Medal in Informatics Olympiad"

Exclude soft skills, traits, or general personal qualities.

Respond ONLY in valid JSON format with exactly the following keys:
`name`, `email`, `skills`

CV Content:
{text}

Return only the JSON. No explanation. No formatting.
""".strip()

        # Invoke the LLM
        response = self.llm.invoke(prompt)

        if not response.content or response.content.strip() == "":
            raise ValueError("Received empty response from LLM.")

        content = response.json()["data"]

        # Clean up Markdown code block formatting if any
        if content.startswith("```json") and content.endswith("```"):
            content = content[7:-3].strip()
        elif content.startswith("```") and content.endswith("```"):
            content = content[3:-3].strip()

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON from LLM after cleaning: {content}") from e

        # Ensure correct keys exist
        parsed = {
            "name": parsed.get("name"),
            "email": parsed.get("email"),
            "skills": parsed.get("skills", [])
        }

        state.parsed_cv = parsed
        return state