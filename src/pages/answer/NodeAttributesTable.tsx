import React from 'react'
import { Box, Table, TableBody, TableCell, TableRow } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from '@tanstack/react-router'

import {
  ChemicalStructureDrawing,
  ChemicalStructureLoading,
} from '../../components/ChemicalStructure'
import { useChemicalSmiles } from '../../hooks/useChemicalSmiles'

const StyledTableBody = styled(TableBody)(() => ({
  '& .MuiTableRow-root:last-of-type .MuiTableCell-root': {
    borderBottom: 'none',
  },
}))

interface ValueCellProps {
  value: string | number | (string | number)[] | undefined
}

const ValueCell: React.FC<ValueCellProps> = ({ value }) => (
  <TableCell>
    <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
      {Array.isArray(value) ? (
        value.map((valueItem, valueItemIndex) => <li key={valueItemIndex}>{valueItem}</li>)
      ) : (
        <li>{value}</li>
      )}
    </ul>
  </TableCell>
)

interface NodeData {
  name?: string | number | (string | number)[]
  id?: string | number | (string | number)[]
  categories?: string | number | (string | number)[]
  count?: string | number | (string | number)[]
  attributes?: Array<{
    attribute_type_id?: string
    original_attribute_name?: string
    value?: string | number | boolean | (string | number | boolean)[]
  }>
}

type NodeAttribute = NonNullable<NodeData['attributes']>[number]

function findSmilesAttribute(attributes: NodeAttribute[] | undefined): string | null {
  if (!Array.isArray(attributes)) return null
  for (const attribute of attributes) {
    const name = (attribute.original_attribute_name || '').toLowerCase()
    const typeId = (attribute.attribute_type_id || '').toLowerCase()
    if (name !== 'smiles' && !typeId.endsWith('smiles')) continue
    const values = Array.isArray(attribute.value) ? attribute.value : [attribute.value]
    const smiles = values.find((v): v is string => typeof v === 'string' && v.length > 0)
    if (smiles) return smiles
  }
  return null
}

const StructureRow: React.FC<{
  id: string | undefined
  attributes: NodeAttribute[] | undefined
}> = ({ id, attributes }) => {
  const knownSmiles = findSmilesAttribute(attributes)
  const { result, isLoading } = useChemicalSmiles(id, knownSmiles)

  if (!isLoading && !result) return null

  return (
    <TableRow style={{ verticalAlign: 'top' }}>
      <TableCell>Structure</TableCell>
      <TableCell>
        {isLoading || !result ? (
          <ChemicalStructureLoading />
        ) : (
          <ChemicalStructureDrawing
            smiles={result.smiles}
            source={result.source}
            showSmiles={!knownSmiles}
          />
        )}
      </TableCell>
    </TableRow>
  )
}

interface NodeAttributesTableProps {
  nodeData: NodeData
}

const NodeAttributesTable: React.FC<NodeAttributesTableProps> = ({ nodeData }) => {
  const { name, id, categories, count, attributes } = nodeData

  return (
    <Box style={{ maxHeight: 500, overflow: 'auto' }}>
      <Table size='small' aria-label='node attributes table'>
        <StyledTableBody>
          {Boolean(name) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>Name</TableCell>
              <ValueCell value={name} />
            </TableRow>
          )}

          {Boolean(id) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>ID</TableCell>
              {/* <ValueCell value={id} /> */}
              <TableCell>
                {id && typeof id === 'string' ? (
                  <Link to='/details/$details_id' params={{ details_id: id }}>
                    {id}
                  </Link>
                ) : (
                  <ValueCell value={id} />
                )}
              </TableCell>
            </TableRow>
          )}

          {Boolean(categories) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>Categories</TableCell>
              <ValueCell value={categories} />
            </TableRow>
          )}

          <StructureRow id={typeof id === 'string' ? id : undefined} attributes={attributes} />

          {Boolean(count) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>Count</TableCell>
              <ValueCell value={count} />
            </TableRow>
          )}

          {Array.isArray(attributes) &&
            attributes.map((attribute, index) => (
              <TableRow key={`attribute-${index}`} style={{ verticalAlign: 'top' }}>
                <TableCell>
                  {attribute.original_attribute_name || attribute.attribute_type_id}
                </TableCell>
                <TableCell>
                  <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
                    {Array.isArray(attribute.value) ? (
                      attribute.value.map((valueItem, valueIndex) => (
                        <li key={valueIndex}>{valueItem}</li>
                      ))
                    ) : (
                      <li>{attribute.value}</li>
                    )}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
        </StyledTableBody>
      </Table>
    </Box>
  )
}

export default NodeAttributesTable
