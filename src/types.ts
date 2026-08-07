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

export type DailyCurrentAffair = {
  id: number;
  slug: string;
  caption: string | null;
  date: string;
  images: string[];
  published: boolean;
};

export type DailyCurrentAffairFormValues = {
  caption: string;
  date: string;
  images: string[];
  published: boolean;
};

export type Exam = {
  id: number;
  slug: string;
  title: string;
  category: string;
  examDate: string | null;
  summary: string;
  aboutExam: string;
  examPattern: string;
  syllabus: string;
  coverImageUrl: string | null;
  officialLink: string | null;
  published: boolean;
};

export type ExamFormValues = {
  title: string;
  category: string;
  examDate: string;
  summary: string;
  aboutExam: string;
  examPattern: string;
  syllabus: string;
  coverImageUrl: string | null;
  officialLink: string;
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

export type Video = {
  id: number;
  slug: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  thumbnailUrl: string;
  category: string;
  description: string;
  date: string;
  published: boolean;
};

export type VideoFormValues = {
  title: string;
  youtubeUrl: string;
  category: string;
  description: string;
  date: string;
  published: boolean;
};

export type InstagramMediaType = "REEL" | "POST";

export type InstagramPost = {
  id: number;
  slug: string;
  title: string;
  permalink: string;
  mediaType: InstagramMediaType;
  thumbnailUrl: string;
  caption: string | null;
  date: string;
  published: boolean;
};

export type InstagramPostFormValues = {
  title: string;
  permalink: string;
  mediaType: InstagramMediaType;
  thumbnailUrl: string | null;
  caption: string;
  date: string;
  published: boolean;
};

export type ApiError = {
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
};
