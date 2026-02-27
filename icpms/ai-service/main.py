"""
ICPMS AI Matching Service
FastAPI microservice for TF-IDF cosine similarity based job-student matching
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("icpms-ai")

app = FastAPI(
    title="ICPMS AI Matching Service",
    description="TF-IDF + Cosine Similarity based student-job matching",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentInput(BaseModel):
    id: str
    skills: List[str] = []
    resume_text: str = ""


class MatchRequest(BaseModel):
    jd_text: str
    required_skills: List[str] = []
    students: List[StudentInput]


class MatchResult(BaseModel):
    student_id: str
    match_score: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []


class MatchResponse(BaseModel):
    results: List[MatchResult]
    total: int


def preprocess_text(text: str) -> str:
    """Clean and normalize text for TF-IDF"""
    text = text.lower()
    # Keep alphanumeric, +, #, . for tech terms like C++, .NET, Node.js
    text = re.sub(r'[^a-z0-9+#.\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def build_student_document(student: StudentInput) -> str:
    """Combine student skills and resume text into a single document"""
    skills_text = " ".join(student.skills)
    # Weight skills more by repeating them
    return f"{skills_text} {skills_text} {student.resume_text}"


def compute_skill_overlap(required_skills: List[str], student_skills: List[str]):
    """Compute exact skill overlap"""
    req_set = {s.lower().strip() for s in required_skills}
    stu_set = {s.lower().strip() for s in student_skills}

    matched = list(req_set & stu_set)
    missing = list(req_set - stu_set)

    skill_score = len(matched) / len(req_set) if req_set else 0.5
    return matched, missing, skill_score


@app.get("/")
def root():
    return {"message": "ICPMS AI Service is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/match", response_model=MatchResponse)
def match_students(request: MatchRequest):
    """
    Core AI matching endpoint.
    Uses TF-IDF vectorization + cosine similarity to score student-JD fit.
    """
    if not request.students:
        raise HTTPException(status_code=400, detail="No students provided")

    logger.info(f"Matching {len(request.students)} students for JD: {request.jd_text[:100]}...")

    # Build JD document
    jd_doc = preprocess_text(
        f"{request.jd_text} {' '.join(request.required_skills)} "
        f"{' '.join(request.required_skills)}"  # double weight skills
    )

    # Build student documents
    student_docs = [
        preprocess_text(build_student_document(s))
        for s in request.students
    ]

    # TF-IDF Vectorization
    all_docs = [jd_doc] + student_docs

    try:
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),  # unigrams + bigrams
            min_df=1,
            max_features=5000,
            stop_words='english'
        )
        tfidf_matrix = vectorizer.fit_transform(all_docs)

        jd_vector = tfidf_matrix[0]
        student_vectors = tfidf_matrix[1:]

        # Cosine similarity
        similarities = cosine_similarity(jd_vector, student_vectors)[0]

    except Exception as e:
        logger.error(f"TF-IDF error: {e}")
        # Fallback to uniform scores
        similarities = [0.5] * len(request.students)

    # Build results with skill overlap bonus
    results = []
    for i, student in enumerate(request.students):
        text_score = float(similarities[i])

        matched, missing, skill_score = compute_skill_overlap(
            request.required_skills, student.skills
        )

        # Weighted combination: 55% text similarity + 45% skill match
        combined_score = text_score * 0.55 + skill_score * 0.45

        # Scale to 0.3–0.95 range for better presentation
        final_score = min(0.30 + combined_score * 0.65, 0.95)

        results.append(MatchResult(
            student_id=student.id,
            match_score=round(final_score, 4),
            matched_skills=matched,
            missing_skills=missing
        ))

    # Sort by match score descending
    results.sort(key=lambda x: x.match_score, reverse=True)

    logger.info(f"Matching complete. Top score: {results[0].match_score if results else 0}")

    return MatchResponse(results=results, total=len(results))


@app.post("/score-single")
def score_single(data: dict):
    """Quick single-student match score"""
    jd_text = data.get("jd_text", "")
    student_skills = data.get("student_skills", [])
    resume_text = data.get("resume_text", "")
    required_skills = data.get("required_skills", [])

    student = StudentInput(id="temp", skills=student_skills, resume_text=resume_text)
    req = MatchRequest(jd_text=jd_text, required_skills=required_skills, students=[student])

    result = match_students(req)
    return {"match_score": result.results[0].match_score if result.results else 0}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
