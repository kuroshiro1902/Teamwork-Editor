export const EFileType: { [key: string]: FileType } = {
  javascript: {
    lang: "javascript",
    extension: "js",
    fileColor: "var(--bs-yellow)",
  },
  js: {
    lang: "javascript",
    extension: "js",
    fileColor: "var(--bs-yellow)",
  },
  typescript: {
    lang: "typescript",
    extension: "ts",
    fileColor: "var(--bs-blue)",
  },
  ts: {
    lang: "typescript",
    extension: "ts",
    fileColor: "var(--bs-blue)",
  },
  java: {
    lang: "java",
    extension: "java",
    fileColor: "var(--bs-red)",
  },
  html: {
    lang: "html",
    extension: "html",
    fileColor: "var(--bs-orange)",
  },
  python: {
    lang: "python",
    extension: "py",
    fileColor: "var(--bs-cyan)",
  },
  py: {
    lang: "python",
    extension: "py",
    fileColor: "var(--bs-cyan)",
  },
};

interface FileType {
  lang: string;
  extension: string;
  fileColor: string;
}
