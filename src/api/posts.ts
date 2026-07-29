import { apiDelete, apiGet, apiSendJson } from "./client";
import type { Post, PostFormValues } from "../types";
import { contentToParagraphs } from "../utils/content";

function toPayload(values: PostFormValues) {
  return {
    title: values.title,
    date: values.date,
    author: values.author,
    tag: values.tag,
    excerpt: values.excerpt,
    content: contentToParagraphs(values.content),
    coverImageUrl: values.coverImageUrl,
    published: values.published,
  };
}

export function listPosts(): Promise<Post[]> {
  return apiGet<Post[]>("/api/posts");
}

export function createPost(values: PostFormValues): Promise<Post> {
  return apiSendJson<Post>("/api/posts", "POST", toPayload(values));
}

export function updatePost(id: number, values: PostFormValues): Promise<Post> {
  return apiSendJson<Post>(`/api/posts/${id}`, "PUT", toPayload(values));
}

export function deletePost(id: number): Promise<void> {
  return apiDelete(`/api/posts/${id}`);
}
