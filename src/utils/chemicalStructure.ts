import axios from 'axios'

import API from '../API'

const PUBCHEM_PUG_REST = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'

export type SmilesSource = 'ROBOKOP KG' | 'PubChem'

export interface SmilesResult {
  smiles: string
  source: SmilesSource
}

function curiePrefix(curie: string): string {
  return curie.split(':', 1)[0].toUpperCase()
}

function curieLocalId(curie: string): string {
  return curie.slice(curie.indexOf(':') + 1)
}

export function supportsStructurePreview(curie: string | undefined | null): curie is string {
  if (!curie || !curie.includes(':')) return false
  const prefix = curiePrefix(curie)
  return prefix === 'CHEBI' || prefix === 'PUBCHEM.COMPOUND'
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

async function fetchSmilesFromKG(curie: string): Promise<string | null> {
  const node = await API.details.getNodeDetails(curie)
  if (node && node.status === 'error') {
    throw new Error(node.message || 'Failed to look up node in ROBOKOP KG')
  }
  return nonEmptyString(node?.properties?.smiles)
}

async function fetchSmilesFromPubChem(curie: string): Promise<string | null> {
  const prefix = curiePrefix(curie)
  const localId = encodeURIComponent(curieLocalId(curie))

  let url: string
  if (prefix === 'PUBCHEM.COMPOUND') {
    url = `${PUBCHEM_PUG_REST}/compound/cid/${localId}/property/SMILES/JSON`
  } else if (prefix === 'CHEBI') {
    url = `${PUBCHEM_PUG_REST}/compound/xref/RegistryID/CHEBI:${localId}/property/SMILES/JSON`
  } else {
    return null
  }

  try {
    const response = await axios.get(url)
    const properties = response.data?.PropertyTable?.Properties
    if (!Array.isArray(properties)) return null
    for (const prop of properties) {
      const smiles = nonEmptyString(prop?.SMILES)
      if (smiles) return smiles
    }
    return null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export async function fetchSmiles(curie: string): Promise<SmilesResult | null> {
  if (curiePrefix(curie) === 'CHEBI') {
    let kgError: unknown = null
    try {
      const smiles = await fetchSmilesFromKG(curie)
      if (smiles) return { smiles, source: 'ROBOKOP KG' }
    } catch (e) {
      kgError = e
    }

    try {
      const smiles = await fetchSmilesFromPubChem(curie)
      return smiles ? { smiles, source: 'PubChem' } : null
    } catch (e) {
      throw kgError ?? e
    }
  }

  const smiles = await fetchSmilesFromPubChem(curie)
  return smiles ? { smiles, source: 'PubChem' } : null
}
