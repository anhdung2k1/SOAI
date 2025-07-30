from prometheus_client import Counter, Histogram, Gauge

# === COUNTERS ===

# CV (Curriculum Vitae) metrics
cv_upload_total = Counter("cv_upload_total", "Tổng số CV đã upload")
cv_approved_total = Counter("cv_approved_total", "Tổng số CV đã duyệt")
cv_rejected_total = Counter("cv_rejected_total", "Tổng số CV bị từ chối")
cv_deleted_total = Counter("cv_deleted_total", "Tổng số CV đã xóa")

# JD (Job Description) metrics
jd_upload_total = Counter("jd_upload_total", "Tổng số JD đã upload")
jd_deleted_total = Counter("jd_deleted_total", "Tổng số JD đã xóa")

# Interview metrics
interview_scheduled_total = Counter("interview_scheduled_total", "Số lịch phỏng vấn đã lên")
interview_accepted_total = Counter("interview_accepted_total", "Số phỏng vấn đã xác nhận")
interview_rejected_total = Counter("interview_rejected_total", "Số phỏng vấn bị hủy")
interview_deleted_total = Counter("interview_deleted_total", "Số phỏng vấn đã xóa")

# Interview Question metrics
interview_questions_generated_total = Counter("interview_questions_generated_total", "Số lần sinh câu hỏi phỏng vấn")
interview_questions_regenerated_total = Counter("interview_questions_regenerated_total", "Số lần tạo lại câu hỏi phỏng vấn")
question_generation_failed_total = Counter("question_generation_failed_total", "Số lần sinh câu hỏi phỏng vấn lỗi")
regenerate_questions_failed_total = Counter("regenerate_questions_failed_total", "Số lần tạo lại câu hỏi phỏng vấn lỗi")

# Auth / JWT Counters
jwt_verification_total = Counter("jwt_verification_total", "Số lần xác thực JWT")
jwt_verification_failed_total = Counter("jwt_verification_failed_total", "Số lần xác thực JWT thất bại")

# === HISTOGRAMS ===

cv_processing_duration_seconds = Histogram(
    "cv_processing_duration_seconds",
    "Thời gian xử lý và ghép nối CV (giây)",
    buckets=[0.5, 1, 2, 3, 5, 10]
)

cv_approval_duration_seconds = Histogram(
    "cv_approval_duration_seconds",
    "Thời gian duyệt CV (giây)",
    buckets=[0.1, 0.5, 1, 2, 5]
)

jd_upload_duration_seconds = Histogram(
    "jd_upload_duration_seconds",
    "Thời gian upload và validate JD (giây)",
    buckets=[0.1, 0.3, 0.5, 1, 2, 5]
)

interview_scheduling_duration_seconds = Histogram(
    "interview_scheduling_duration_seconds",
    "Thời gian lên lịch phỏng vấn (giây)",
    buckets=[0.1, 0.3, 0.5, 1, 2, 5]
)

interview_acceptance_duration_seconds = Histogram(
    "interview_acceptance_duration_seconds",
    "Thời gian xác nhận phỏng vấn & sinh câu hỏi (giây)",
    buckets=[0.3, 0.5, 1, 2, 3, 5, 10]
)

interview_question_generation_duration_seconds = Histogram(
    "interview_question_generation_duration_seconds",
    "Thời gian sinh câu hỏi phỏng vấn bằng GenAI (giây)",
    buckets=[0.3, 0.5, 1, 2, 5, 10]
)

# === GAUGES ===

pending_cv_count = Gauge("pending_cv_count", "Số CV đang chờ duyệt")
scheduled_interview_count = Gauge("scheduled_interview_count", "Số lịch phỏng vấn đã lên")
interview_question_count = Gauge("interview_question_count", "Số câu hỏi phỏng vấn hiện tại trong DB")
jd_count = Gauge("jd_count", "Số JD hiện tại trong DB")
