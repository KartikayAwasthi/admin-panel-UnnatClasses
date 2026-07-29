export function contentToParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

export function paragraphsToContent(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}
