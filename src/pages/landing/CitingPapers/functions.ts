import axios from "axios";
import { citationsRoutes } from "../../../API/routes";

export const getCitingPapers = async (): Promise<CitingPaper[]> => {
  const response = await axios.get(citationsRoutes.base);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch citing papers: ${response.statusText}`);
  }
  return response.data;
};

interface CitingPaper {
  paperId?: string;
  url: string;
  title: string;
  venue: string;
  year: number | null;
  authors: Author[];
  id: string;
}

interface Author {
  authorId: string;
  name: string;
}
