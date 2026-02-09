export function formatBuildDate(buildTime: string) {
  const date = new Date(buildTime);

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
