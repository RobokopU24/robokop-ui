import axios from "axios";
import utils from "./utils";
import { api } from "./baseUrlProxy";

export interface GraphMetadataV2 {
  "@context": Record<string, string>;
  "@id": string;
  "@type": string;
  name: string;
  description: string;
  license: string;
  url: string;
  version: string;
  dateCreated: string;
  dateModified: string;
  keywords: string[];
  creator: Array<{
    "@type": string;
    "@id": string;
    name: string;
    url?: string;
    email?: string;
    affiliation?: {
      "@type": string;
      "@id": string;
      name: string;
    };
  }>;
  contactPoint: Array<{
    "@type": string;
    contactType: string;
    url?: string;
    email?: string;
  }>;
  funder: Array<{
    "@type": string;
    "@id": string;
    name: string;
    url: string;
  }>;
  conformsTo: Array<{
    "@id": string;
    name: string;
  }>;
  schema: {
    "@type": string;
    "@id": string;
    name: string;
    description: string;
    encodingFormat: string;
  };
  biolinkVersion: string;
  babelVersion: string;
  distribution: Array<{
    "@type": string;
    encodingFormat: string;
    contentUrl: string;
  }>;
  hasPart?: Array<{
    "@id": string;
    name: string;
    "orion:nodeCount": number;
    "orion:edgeCount": number;
  }>;
  isBasedOn: Array<{
    "@type": string;
    id: string;
    name: string;
    description: string;
    license: string;
    attribution: string;
    url: string;
    contentUrl: string;
    citation: string[];
    version: string;
  }>;
}

export default {
  /**
   * Fetches graph metadata from the v2 JSON structure.
   *
   * @param graphId - The graph ID
   */
  async metadata(graphId: string): Promise<GraphMetadataV2 | null> {
    try {
      const response = await api.get(`/api/graph-metadata/${graphId}`);
      if (response.status !== 200) {
        return null;
      }
      return response.data;
    } catch (_) {
      return null;
    }
  },
};
