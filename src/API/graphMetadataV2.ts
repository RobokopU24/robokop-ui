import axios from "axios";
import utils from "./utils";

const METADATA_JSON_PATH = "/json/robokop-kg.json";

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
  datePublished: string;
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
    email: string;
    url?: string;
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
    "@id": string;
    "@type": string;
    contentUrl: string;
    encodingFormat: string;
    description: string;
  }>;
  isBasedOn: Array<{
    id: string;
    name: string;
    description: string;
    license: string;
    attribution: string;
    url: string;
    citation: string;
    fullCitation: string;
    version: string;
    "@type": string;
  }>;
}

export default {
  /**
   * Fetches graph metadata from the v2 JSON structure.
   * Currently returns the same robokop-kg.json for all graph IDs.
   * This will be updated once the API is available for other graphs.
   *
   * @param _graphId - The graph ID (currently unused, will be used when API is published)
   */
  async metadata(_graphId: string): Promise<GraphMetadataV2 | ReturnType<typeof utils.handleAxiosError>> {
    try {
      const response = await axios({
        method: "get",
        url: METADATA_JSON_PATH,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {} as GraphMetadataV2;
      }
      return utils.handleAxiosError(error as any);
    }
  },
};
