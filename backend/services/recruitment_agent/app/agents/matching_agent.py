import json
from agents.base_agent import BaseAgent
from agents.state import RecruitmentState
from config.log_config import AppLogger
from config.constants import *

logger = AppLogger(__name__)


class MatchingAgent(BaseAgent):
    def __init__(self, llm):
        self.llm = llm

    def run(self, state: RecruitmentState) -> RecruitmentState:
        if state.stop_pipeline:
            return state

        if not state.jd_list:
            logger.warn("[MatchingAgent] No job descriptions available.")
            state.matched_jd = None
            return state

        if not state.parsed_cv:
            logger.warn("[MatchingAgent] No parsed CV found.")
            state.matched_jd = None
            return state

        parsed_cv = state.parsed_cv
        cv_skills = parsed_cv.get("skills", [])

        def parse_scores(skills):
            scores = {}
            for item in skills:
                if ":" in item:
                    try:
                        key, value = item.split(":", 1)
                        scores[key.strip()] = float(value.strip())
                    except:
                        continue
            return scores

        cv_scores = parse_scores(cv_skills)

        best_match = None
        best_score = 0.0
        best_jd_skills = []

        for jd in state.jd_list:
            jd_skills_raw = jd.get("skills_required", [])
            if isinstance(jd_skills_raw, str):
                try:
                    jd_skills_raw = json.loads(jd_skills_raw)
                except Exception as e:
                    logger.error(f"[MatchingAgent] Failed to parse JD skills: {e}")
                    continue

            jd_scores = parse_scores(jd_skills_raw)

            # === Subject-based score ===
            total_pct = 0
            count = 0
            for subject, required_score in jd_scores.items():
                actual = cv_scores.get(subject)
                if actual is not None:
                    pct = min((actual / required_score) * 100, 100)
                    total_pct += pct
                    count += 1

            if count == 0:
                continue

            avg_pct = total_pct / count
            score_subjects = min(avg_pct * 0.7, 70)

            # === LLM score for extras ===
            prompt = self.build_extras_prompt(parsed_cv)
            score_extras_raw = self.query_llm_score(prompt)
            score_extras = min(score_extras_raw * 0.3, 30)

            total_score = round(score_subjects + score_extras, 2)

            logger.debug(
                f"[MatchingAgent] JD: {jd.get('position')} → total_score: {total_score:.2f}"
            )

            if total_score > best_score:
                best_score = total_score
                best_match = jd
                best_jd_skills = jd_skills_raw

        if best_match:
            state.matched_jd = {
                "position": best_match.get("position"),
                "skills_required": best_jd_skills,
                "level": best_match.get("level"),
                "match_score": int(best_score)
            }
            logger.info(
                f"[MatchingAgent] Best match: {best_match.get('position')} (match_score={best_score:.2f}%)"
            )
        else:
            state.matched_jd = None
            logger.info("[MatchingAgent] No matched JD found.")

        return state

    def build_extras_prompt(self, parsed_cv: dict) -> str:
        return f"""
You are evaluating a student's profile for high school admission. Based on the provided CV content, assess the candidate’s overall academic potential, including:

- Academic awards or competitions
- Personal projects or portfolio
- Logical or critical thinking ability
- Learning motivation and independence

Score the candidate on a scale from 0 to 100 based on these aspects only (not subject scores).

CV Content:
{json.dumps(parsed_cv, ensure_ascii=False, indent=2)}

Return only a single integer number, like: 85
""".strip()

    def query_llm_score(self, prompt: str) -> float:
        try:
            response = self.llm.invoke(prompt)
            content = response.json()["data"]

            if content.startswith("```") and content.endswith("```"):
                content = content.strip("```").strip()

            return min(max(float(content), 0.0), 100.0)
        except Exception as e:
            logger.error(f"[MatchingAgent] LLM score failed: {e}")
            return 0.0
