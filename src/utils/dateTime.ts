export function formatBuildDate(buildTime: string) {
  console.log("Build time:", buildTime);
  const [datePart, timePart] = buildTime?.split(" ");

  if (!timePart) {
    const date = new Date(buildTime);

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else {
    const [month, day, year] = datePart?.split("-").map(Number);
    const [hours, minutes, seconds] = timePart?.split(":").map(Number);

    const fullYear = 2000 + year;

    const date = new Date(fullYear, month - 1, day, hours, minutes, seconds);

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}
