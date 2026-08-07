import { apiDelete, apiGet, apiSendJson } from "./client";
import type { InstagramPost, InstagramPostFormValues } from "../types";

function toPayload(values: InstagramPostFormValues) {
  return {
    title: values.title,
    permalink: values.permalink,
    mediaType: values.mediaType,
    thumbnailUrl: values.thumbnailUrl,
    caption: values.caption,
    date: values.date,
    published: values.published,
  };
}

export function listInstagramPosts(): Promise<InstagramPost[]> {
  return apiGet<InstagramPost[]>("/api/instagram-posts");
}

export function createInstagramPost(values: InstagramPostFormValues): Promise<InstagramPost> {
  return apiSendJson<InstagramPost>("/api/instagram-posts", "POST", toPayload(values));
}

export function updateInstagramPost(id: number, values: InstagramPostFormValues): Promise<InstagramPost> {
  return apiSendJson<InstagramPost>(`/api/instagram-posts/${id}`, "PUT", toPayload(values));
}

export function deleteInstagramPost(id: number): Promise<void> {
  return apiDelete(`/api/instagram-posts/${id}`);
}
