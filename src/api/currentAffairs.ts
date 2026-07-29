import { apiDelete, apiGet, apiSendJson } from "./client";
import type { CurrentAffair, CurrentAffairFormValues } from "../types";
import { contentToParagraphs } from "../utils/content";

function toPayload(values: CurrentAffairFormValues) {
  return {
    title: values.title,
    date: values.date,
    category: values.category,
    summary: values.summary,
    content: contentToParagraphs(values.content),
    coverImageUrl: values.coverImageUrl,
    published: values.published,
  };
}

export function listCurrentAffairs(): Promise<CurrentAffair[]> {
  return apiGet<CurrentAffair[]>("/api/current-affairs");
}

export function createCurrentAffair(values: CurrentAffairFormValues): Promise<CurrentAffair> {
  return apiSendJson<CurrentAffair>("/api/current-affairs", "POST", toPayload(values));
}

export function updateCurrentAffair(id: number, values: CurrentAffairFormValues): Promise<CurrentAffair> {
  return apiSendJson<CurrentAffair>(`/api/current-affairs/${id}`, "PUT", toPayload(values));
}

export function deleteCurrentAffair(id: number): Promise<void> {
  return apiDelete(`/api/current-affairs/${id}`);
}
