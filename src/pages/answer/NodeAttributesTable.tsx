import React, { useState } from 'react'
import { Box, Button, Table, TableBody, TableCell, TableRow } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from '@tanstack/react-router'

import {
  ChemicalStructureDrawing,
  ChemicalStructureLoading,
} from '../../components/ChemicalStructure'
import { useChemicalSmiles } from '../../hooks/useChemicalSmiles'

const MAX_LIST_ITEMS = 5
const MAX_TEXT_LENGTH = 200

const StyledTableBody = styled(TableBody)(() => ({
  '& .MuiTableRow-root': {
    verticalAlign: 'top',
  },
  '& .MuiTableCell-root': {
    overflowWrap: 'anywhere',
  },
  '& .MuiTableRow-root .MuiTableCell-root:first-of-type': {
    width: 150,
    fontWeight: 500,
  },
  '& .MuiTableRow-root:last-of-type .MuiTableCell-root': {
    borderBottom: 'none',
  },
}))

type ScalarValue = string | number | boolean
type AttributeValue = ScalarValue | ScalarValue[] | undefined

function ToggleButton({
  expanded,
  label,
  onClick,
}: {
  expanded: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button
      size='small'
      onClick={onClick}
      sx={{ py: 0, px: 0.75, ml: -0.75, minWidth: 0, textTransform: 'none', fontSize: '0.75rem' }}
    >
      {expanded ? 'Show less' : label}
    </Button>
  )
}

const ExpandableText: React.FC<{ text: string }> = ({ text }) => {
  const [expanded, setExpanded] = useState(false)
  if (text.length <= MAX_TEXT_LENGTH) return <>{text}</>
  return (
    <>
      {expanded ? text : `${text.slice(0, MAX_TEXT_LENGTH).trimEnd()}…`}{' '}
      <ToggleButton expanded={expanded} label='Show more' onClick={() => setExpanded(!expanded)} />
    </>
  )
}

const ValueList: React.FC<{ value: AttributeValue }> = ({ value }) => {
  const [expanded, setExpanded] = useState(false)
  const items = Array.isArray(value) ? value : [value]
  const hiddenCount = items.length - MAX_LIST_ITEMS
  const visibleItems = expanded || hiddenCount <= 0 ? items : items.slice(0, MAX_LIST_ITEMS)

  return (
    <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
      {visibleItems.map((item, index) => (
        <li key={index}>
          {typeof item === 'string' ? (
            <ExpandableText text={item} />
          ) : item === undefined ? null : (
            String(item)
          )}
        </li>
      ))}
      {hiddenCount > 0 && (
        <li>
          <ToggleButton
            expanded={expanded}
            label={`Show ${hiddenCount} more`}
            onClick={() => setExpanded(!expanded)}
          />
        </li>
      )}
    </ul>
  )
}

const ValueCell: React.FC<{ value: AttributeValue }> = ({ value }) => (
  <TableCell>
    <ValueList value={value} />
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
    <TableRow>
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
    <Box sx={{ width: 'min(560px, 90vw)', maxHeight: 'min(500px, 70vh)', overflow: 'auto' }}>
      <Table size='small' aria-label='node attributes table' sx={{ tableLayout: 'fixed' }}>
        <StyledTableBody>
          {Boolean(name) && (
            <TableRow>
              <TableCell>Name</TableCell>
              <ValueCell value={name} />
            </TableRow>
          )}

          {Boolean(id) && (
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>
                {id && typeof id === 'string' ? (
                  <Link to='/details/$details_id' params={{ details_id: id }}>
                    {id}
                  </Link>
                ) : (
                  <ValueList value={id} />
                )}
              </TableCell>
            </TableRow>
          )}

          {Boolean(categories) && (
            <TableRow>
              <TableCell>Categories</TableCell>
              <ValueCell value={categories} />
            </TableRow>
          )}

          <StructureRow id={typeof id === 'string' ? id : undefined} attributes={attributes} />

          {Boolean(count) && (
            <TableRow>
              <TableCell>Count</TableCell>
              <ValueCell value={count} />
            </TableRow>
          )}

          {Array.isArray(attributes) &&
            attributes.map((attribute, index) => (
              <TableRow key={`attribute-${index}`}>
                <TableCell>
                  {attribute.original_attribute_name || attribute.attribute_type_id}
                </TableCell>
                <ValueCell value={attribute.value} />
              </TableRow>
            ))}
        </StyledTableBody>
      </Table>
    </Box>
  )
}

export default NodeAttributesTable
