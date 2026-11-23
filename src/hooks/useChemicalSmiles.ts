import { useQuery } from '@tanstack/react-query'

import { fetchSmiles, SmilesResult, supportsStructurePreview } from '../utils/chemicalStructure'

interface ChemicalSmilesState {
  result: SmilesResult | null | undefined
  isLoading: boolean
  isError: boolean
}

export function useChemicalSmiles(
  curie: string | null | undefined,
  knownSmiles?: string | null,
): ChemicalSmilesState {
  const query = useQuery({
    queryKey: ['chemical-smiles', curie],
    queryFn: () => fetchSmiles(curie as string),
    enabled: !knownSmiles && supportsStructurePreview(curie),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  })

  if (knownSmiles) {
    return {
      result: { smiles: knownSmiles, source: 'Result attributes' },
      isLoading: false,
      isError: false,
    }
  }

  return { result: query.data, isLoading: query.isLoading, isError: query.isError }
}
