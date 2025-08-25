import json
import re
from typing import Any, Dict
from config.log_config import AppLogger
from utils.utils import *
from agents.base_agent import BaseAgent
from agents.state import RecruitmentState
logger = AppLogger(__name__)

class CVParserAgent(BaseAgent):
    def __init__(self, llm):
        self.llm = llm

    def _build_main_parse_prompt(self, cv_text: str) -> str:
        schema_example: Dict[str, Any] = {
            "name": "string",
            "email": "string",
            "skills": ["string"],
            "experience_years": 0,
            "education": [
                {
                    "degree": "string",
                    "major": "string",
                    "institution": "string",
                    "country": "string|null",
                    "start_date": "YYYY-MM|null",
                    "end_date": "YYYY-MM|null",
                    "gpa": "float|null",
                    "gpa_scale": "float|null",
                }
            ],
            "highest_degree_level": "BACHELOR|MASTER|PHD|OTHER|UNKNOWN",
            "certifications": [
                {"name": "string", "issuer": "string|null", "date": "YYYY-MM|null", "credential_id": "string|null"}
            ],
            "languages": [{"language": "string", "proficiency_cefr": "A1|A2|B1|B2|C1|C2|Unknown"}],
            "university_evaluation": {
                "best_institution": "string|null",
                "rank_tier": "Top10|Top50|Top100|Top200|Top500|Top1000|>1000|Unknown",
                "estimated_score": 0,
                "rationale": "string",
                "confidence": 0.0,
            },
        }
        return f"""
Return ONLY ONE valid JSON object. No comments, no extra text.

Fields:
- name
- email
- skills
- experience_years
- education (degree, major, institution, country, start_date, end_date, gpa, gpa_scale)
- highest_degree_level (BACHELOR|MASTER|PHD|OTHER|UNKNOWN)
- certifications (name, issuer, date, credential_id)
- languages (language, proficiency_cefr in A1|A2|B1|B2|C1|C2|Unknown)
- university_evaluation (best_institution, rank_tier, estimated_score, rationale, confidence)

Shape example:
{json.dumps(schema_example, indent=2)}

CV:
{cv_text}
""".strip()

    def _build_languages_prompt(self, cv_text: str) -> str:
        return f"""
Output ONLY a JSON array of objects with keys: language, proficiency_cefr (A1|A2|B1|B2|C1|C2|Unknown).
No comments or extra text.

CV:
{cv_text}
""".strip()

    def run(self, state: RecruitmentState) -> RecruitmentState:
        if state.stop_pipeline:
            return state

        cv_text = ensure_text(extract_text_from_pdf(state.cv_file_path))
        logger.debug("[cv_parser] start")

        main_resp = self.llm.invoke(self._build_main_parse_prompt(cv_text))
        raw = getattr(main_resp, "content", None) or getattr(main_resp, "text", None) or str(main_resp or "")
        raw = unwrap_maybe_wrapper(ensure_text(raw)).strip()
        if not raw:
            logger.error("Empty LLM response (main parse)")
            raise ValueError("Empty LLM response (main parse)")

        cleaned = clean_json_from_text(raw)
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            logger.error("Invalid JSON (main parse)")
            raise ValueError("Invalid JSON (main parse)")

        parsed = validate_parsed_cv(parsed)
        parsed = coerce_types(parsed)
        logger.debug("[cv_parser] main parse ok")

        lang_resp = self.llm.invoke(self._build_languages_prompt(cv_text))
        lang_raw = getattr(lang_resp, "content", None) or getattr(lang_resp, "text", None) or str(lang_resp or "")
        lang_raw = unwrap_maybe_wrapper(ensure_text(lang_raw)).strip()
        lang_clean = clean_json_from_text(lang_raw)

        try:
            languages_json = json.loads(lang_clean) if lang_clean else []
        except Exception:
            logger.error("Invalid JSON (languages)")
            languages_json = []

        languages = validate_languages(languages_json)
        if languages:
            parsed["languages"] = languages
            logger.debug("[cv_parser] languages override ok")
        else:
            logger.debug("[cv_parser] languages override skipped")

        state.parsed_cv = parsed
        logger.info("[cv_parser] completed")
        return state