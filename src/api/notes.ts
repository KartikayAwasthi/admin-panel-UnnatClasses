import { apiDelete, apiGet, apiSendForm } from "./client";
import type { Note, NoteFormValues } from "../types";

function toFormData(values: NoteFormValues, file: File | null): FormData {
  const formData = new FormData();
  formData.append("title", values.title);
  formData.append("subject", values.subject);
  formData.append("classRange", values.classRange);
  formData.append("description", values.description);
  formData.append("published", String(values.published));
  if (file) {
    formData.append("file", file);
  }
  return formData;
}

export function listNotes(): Promise<Note[]> {
  return apiGet<Note[]>("/api/notes");
}

export function createNote(values: NoteFormValues, file: File): Promise<Note> {
  return apiSendForm<Note>("/api/notes", "POST", toFormData(values, file));
}

export function updateNote(id: number, values: NoteFormValues, file: File | null): Promise<Note> {
  return apiSendForm<Note>(`/api/notes/${id}`, "PUT", toFormData(values, file));
}

export function deleteNote(id: number): Promise<void> {
  return apiDelete(`/api/notes/${id}`);
}
