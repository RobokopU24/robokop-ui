import { useQuery } from "@tanstack/react-query";
import citationsData from "../../../temp/citations.json";
import styles from "./CitingPapers.module.css";
import { getCitingPapers } from "./functions";

interface Author {
  authorId: string;
  name: string;
}

interface CitingPaper {
  paperId: string;
  url: string;
  title: string;
  venue: string;
  year: number | null;
  authors: Author[];
}

function formatAuthors(authors: Author[]): string {
  if (authors.length === 0) return "";
  if (authors.length <= 5) return authors.map((a) => a.name).join(", ");
  return (
    authors
      .slice(0, 5)
      .map((a) => a.name)
      .join(", ") + ", et al."
  );
}

export function CitingPapers() {
  const {
    data: entries,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["citingPapers"],
    queryFn: getCitingPapers,
  });
  console.log("Citing papers data:", entries);

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (isError) {
    return <div className={styles.container}>Error occurred while fetching citing papers.</div>;
  }

  return (
    <div className={styles.container}>
      <p>Papers that have cited ROBOKOP ({entries?.length} total):</p>
      <ol className={styles.list}>
        {entries?.map((paper) => (
          <li key={paper?.id}>
            <a href={paper?.url} target="_blank" rel="noreferrer">
              {paper?.title}
            </a>
            {paper?.authors.length > 0 && <> — {formatAuthors(paper?.authors)}</>}
            {paper?.venue && (
              <>
                , <em>{paper?.venue}</em>
              </>
            )}
            {paper?.year && <> ({paper?.year})</>}
          </li>
        ))}
      </ol>
    </div>
  );
}
