import citationsData from "../../../temp/citations.json";
import styles from "./CitingPapers.module.css";

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

interface CitationEntry {
  citingPaper: CitingPaper;
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
  const entries = (citationsData as { data: CitationEntry[] }).data;

  return (
    <div className={styles.container}>
      <p>Papers that have cited ROBOKOP ({entries.length} total):</p>
      <ol className={styles.list}>
        {entries.map(({ citingPaper: paper }) => (
          <li key={paper.paperId}>
            <a href={paper.url} target="_blank" rel="noreferrer">
              {paper.title}
            </a>
            {paper.authors.length > 0 && <> — {formatAuthors(paper.authors)}</>}
            {paper.venue && (
              <>
                , <em>{paper.venue}</em>
              </>
            )}
            {paper.year && <> ({paper.year})</>}
          </li>
        ))}
      </ol>
    </div>
  );
}
