export type Note = {
  id: number;
  slug: string;
  title: string;
  subject: string;
  classRange: string;
  fileType: string;
  fileSize: string;
  fileUrl: string;
  description: string;
  uploadedAt: string;
  published: boolean;
};

export type NoteFormValues = {
  title: string;
  subject: string;
  classRange: string;
  description: string;
  published: boolean;
};

export type CurrentAffair = {
  id: number;
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string[];
  coverImageUrl: string | null;
  published: boolean;
};

export type CurrentAffairFormValues = {
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  published: boolean;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  date: string;
  author: string;
  tag: string;
  excerpt: string;
  content: string[];
  coverImageUrl: string | null;
  published: boolean;
};

export type PostFormValues = {
  title: string;
  date: string;
  author: string;
  tag: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  published: boolean;
};

export type ApiError = {
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
};
