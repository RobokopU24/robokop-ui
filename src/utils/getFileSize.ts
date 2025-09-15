import axios from "axios";

export async function getFileSize(url: string): Promise<number | null> {
  try {
    const response = await axios.head(url);
    const contentLength = response.headers["content-length"];
    if (!contentLength) return null;

    const size = parseInt(String(contentLength), 10);
    return isNaN(size) ? null : size;
  } catch (error) {
    console.error("Error fetching file size:", error);
    return null;
  }
}

export function formatFileSize(bytes: number, decimals: number = 0): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB", "PB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const factor = Math.pow(10, decimals);
  const roundedSize = Math.ceil(size * factor) / factor;

  return `${roundedSize.toFixed(decimals)} ${units[unitIndex]}`;
}
