import React from 'react';
import { useQueryBuilderContext } from '../../../../context/queryBuilder';
import { TextField, Autocomplete } from '@mui/material';

// Types for the query builder context
interface TreeNode {
  name: string;
  children?: TreeNode[];
  mixinChildren?: TreeNode[];
  permissible_values?: Record<string, any>;
}

interface QualifierOption {
  range?: TreeNode;
  subpropertyOf?: TreeNode;
}

interface Association {
  name: string;
  uuid: string;
}

interface Qualifier {
  qualifier: {
    name: string;
  };
  range?: TreeNode;
  subpropertyOf?: TreeNode;
}

interface AssociationData {
  association: Association;
  qualifiers: Qualifier[];
}

interface AssociationOption {
  name: string;
  uuid: string;
  qualifiers: {
    name: string;
    options: string[];
  }[];
}

interface QualifiersSelectorProps {
  id: string;
  associations: AssociationData[];
}

interface QualifiersListProps {
  value: {
    name: string;
    options: string[];
  }[];
  qualifiers: Record<string, string | null>;
  setQualifiers: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
}

const flattenTree = (root: TreeNode, includeMixins?: boolean): TreeNode[] => {
  const items: TreeNode[] = [root];
  if (root.children) {
    for (const child of root.children) {
      items.push(...flattenTree(child, includeMixins));
    }
  }
  if (root.mixinChildren && includeMixins === true) {
    for (const mixinChild of root.mixinChildren) {
      items.push(...flattenTree(mixinChild, includeMixins));
    }
  }
  return items;
};

const getQualifierOptions = ({ range, subpropertyOf }: QualifierOption): string[] => {
  const options: string[] = [];

  if (range) {
    if (range.permissible_values) {
      options.push(...Object.keys(range.permissible_values));
    } else {
      options.push(...flattenTree(range, false).map(({ name }) => name));
    }
  }

  if (subpropertyOf) {
    options.push(...flattenTree(subpropertyOf, false).map(({ name }) => name));
  }

  return options;
};

// const getBestAssociationOption = (associationOptions) => {
//   let best = null;
//   for (const opt of associationOptions) {
//     if (opt.qualifiers.length > (best.length || 0)) best = opt;
//   }
//   return best;
// };

export default function QualifiersSelector({ id, associations }: QualifiersSelectorProps) {
  const queryBuilder = useQueryBuilderContext();

  const associationOptions: AssociationOption[] = associations
    .filter((a: AssociationData) => a.qualifiers.length > 0)
    .map(({ association, qualifiers }: AssociationData) => ({
      name: association.name,
      uuid: association.uuid,
      qualifiers: qualifiers.map((q: Qualifier) => ({
        name: q.qualifier.name,
        options: getQualifierOptions(q),
      })),
    }));

  const [value, setValue] = React.useState<AssociationOption | null>(associationOptions[0] || null);
  const [qualifiers, setQualifiers] = React.useState<Record<string, string | null>>({});
  React.useEffect(() => {
    queryBuilder.dispatch({ type: 'editQualifiers', payload: { id, qualifiers } });
  }, [qualifiers]);

  if (associationOptions.length === 0) return null;
  if (associationOptions.length === 1 && associationOptions[0].name === 'association') return null;

  if (!value) return null;

  const subjectQualfiers = value.qualifiers.filter(({ name }) => name.includes('subject'));
  const predicateQualifiers = value.qualifiers.filter(({ name }) => name.includes('predicate'));
  const objectQualifiers = value.qualifiers.filter(({ name }) => name.includes('object'));
  const otherQualifiers = value.qualifiers.filter(
    (q) =>
      !subjectQualfiers.includes(q) &&
      !predicateQualifiers.includes(q) &&
      !objectQualifiers.includes(q)
  );

  return (
    <div className="qualifiers-dropdown">
      <div style={{ marginRight: '2rem' }}>
        <Autocomplete
          value={value}
          onChange={(_, newValue) => {
            setValue(newValue);
          }}
          disableClearable
          size="small"
          options={associationOptions}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(opt, val) => opt.uuid === val.uuid}
          style={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Association" variant="outlined" />}
        />

        {otherQualifiers.length > 0 && <hr />}

        <QualifiersList
          value={otherQualifiers}
          qualifiers={qualifiers}
          setQualifiers={setQualifiers}
        />
      </div>

      <QualifiersList
        value={subjectQualfiers}
        qualifiers={qualifiers}
        setQualifiers={setQualifiers}
      />
      <QualifiersList
        value={predicateQualifiers}
        qualifiers={qualifiers}
        setQualifiers={setQualifiers}
      />
      <QualifiersList
        value={objectQualifiers}
        qualifiers={qualifiers}
        setQualifiers={setQualifiers}
      />
    </div>
  );
}

function QualifiersList({ value, qualifiers, setQualifiers }: QualifiersListProps) {
  if (value.length === 0) return null;
  return (
    <div className="qualifiers-list">
      {value.map(({ name, options }) => (
        <Autocomplete
          key={name}
          value={qualifiers[name] || null}
          onChange={(_, newValue) => {
            if (newValue === null) {
              setQualifiers((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
              });
            } else {
              setQualifiers((prev) => ({ ...prev, [name]: newValue || null }));
            }
          }}
          options={options}
          renderInput={(params) => <TextField {...params} label={name} variant="outlined" />}
          size="small"
        />
      ))}
    </div>
  );
}
