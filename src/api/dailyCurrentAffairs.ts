import { apiDelete, apiGet, apiSendJson } from "./client";
import type { DailyCurrentAffair, DailyCurrentAffairFormValues } from "../types";

function toPayload(values: DailyCurrentAffairFormValues) {
  return {
    caption: values.caption.trim() === "" ? null : values.caption,
    date: values.date,
    images: values.images,
    published: values.published,
  };
}

export function listDailyCurrentAffairs(): Promise<DailyCurrentAffair[]> {
  return apiGet<DailyCurrentAffair[]>("/api/daily-current-affairs");
}

export function createDailyCurrentAffair(values: DailyCurrentAffairFormValues): Promise<DailyCurrentAffair> {
  return apiSendJson<DailyCurrentAffair>("/api/daily-current-affairs", "POST", toPayload(values));
}

export function updateDailyCurrentAffair(
  id: number,
  values: DailyCurrentAffairFormValues
): Promise<DailyCurrentAffair> {
  return apiSendJson<DailyCurrentAffair>(`/api/daily-current-affairs/${id}`, "PUT", toPayload(values));
}

export function deleteDailyCurrentAffair(id: number): Promise<void> {
  return apiDelete(`/api/daily-current-affairs/${id}`);
}
