import axios from "axios";
import { releasesRoutes } from "../../API/routes";

export type GitHubRelease = {
  id: number;
  tagName: string;
  nodeId?: string;
  name?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  immutable?: boolean;
  targetCommitish?: string;
  htmlUrl?: string;
  url?: string;
  assetsUrl?: string;
  uploadUrl?: string;
  tarballUrl?: string;
  zipballUrl?: string;
  author?: object;
  assets?: object[];
  mentionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export const getReleaseNotes = async (): Promise<GitHubRelease[]> => {
  const res = await axios.get(releasesRoutes.base);
  return res.data;
};
