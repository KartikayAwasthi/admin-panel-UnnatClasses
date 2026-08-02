import { apiDelete, apiGet, apiSendJson } from "./client";
import type { Video, VideoFormValues } from "../types";

function toPayload(values: VideoFormValues) {
  return {
    title: values.title,
    youtubeUrl: values.youtubeUrl,
    category: values.category,
    description: values.description,
    date: values.date,
    published: values.published,
  };
}

export function listVideos(): Promise<Video[]> {
  return apiGet<Video[]>("/api/videos");
}

export function createVideo(values: VideoFormValues): Promise<Video> {
  return apiSendJson<Video>("/api/videos", "POST", toPayload(values));
}

export function updateVideo(id: number, values: VideoFormValues): Promise<Video> {
  return apiSendJson<Video>(`/api/videos/${id}`, "PUT", toPayload(values));
}

export function deleteVideo(id: number): Promise<void> {
  return apiDelete(`/api/videos/${id}`);
}
