import { apiDelete, apiGet, apiSendJson } from "./client";
import type { Exam, ExamFormValues } from "../types";

function toPayload(values: ExamFormValues) {
  return {
    title: values.title,
    category: values.category,
    examDate: values.examDate.trim() === "" ? null : values.examDate,
    summary: values.summary,
    aboutExam: values.aboutExam,
    examPattern: values.examPattern,
    syllabus: values.syllabus,
    coverImageUrl: values.coverImageUrl,
    officialLink: values.officialLink.trim() === "" ? null : values.officialLink,
    published: values.published,
  };
}

export function listExams(): Promise<Exam[]> {
  return apiGet<Exam[]>("/api/exams");
}

export function createExam(values: ExamFormValues): Promise<Exam> {
  return apiSendJson<Exam>("/api/exams", "POST", toPayload(values));
}

export function updateExam(id: number, values: ExamFormValues): Promise<Exam> {
  return apiSendJson<Exam>(`/api/exams/${id}`, "PUT", toPayload(values));
}

export function deleteExam(id: number): Promise<void> {
  return apiDelete(`/api/exams/${id}`);
}
