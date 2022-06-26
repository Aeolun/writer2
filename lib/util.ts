export function getSection(base: string, url?: string) {
  if (url) {
    const parts = url.replace(base, "").split("/");
    return {
      chapter: parts[0],
      chapterNr: parseInt(parts[0]?.replace(/[^0-9]/g, "") || ""),
      pageNr: parts[1]
        ? parseInt(parts[1]?.replace(/[^0-9]/g, "") || "")
        : undefined,
    };
  } else {
    return {
      chapter: "",
      chapterNr: 0,
      pageNr: undefined,
    };
  }
}
