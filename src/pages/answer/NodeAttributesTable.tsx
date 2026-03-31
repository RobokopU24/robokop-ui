import React from 'react'
import { Box, Table, TableBody, TableCell, TableRow } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from '@tanstack/react-router'

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
