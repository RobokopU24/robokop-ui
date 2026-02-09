import axios from 'axios';
import utils from './utils';

const METADATA_ROUTE = "https://robokop-automat.apps.renci.org";

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
  async registry(): Promise<string[] | ReturnType<typeof utils.handleAxiosError>> {
    try {
      const response = await axios( {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${METADATA_ROUTE}/registry`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error as any);
    }
  },

  async metadata(graphId: string){
    try {
      const response = await axios( {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${METADATA_ROUTE}/${graphId}/metadata`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error as any);
    }
  },

  async graphMetadataV2(graphId: string): Promise<GraphMetadataV2 | null> {
    try {
      const response = await axios({
        method: 'get',
        maxBodyLength: Infinity,
        url: `${METADATA_ROUTE}/${graphId}/graph-metadata`,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.status !== 200) {
        return null;
      }
      return response.data;
    } catch (_) {
      return null;
    }
  },
};
