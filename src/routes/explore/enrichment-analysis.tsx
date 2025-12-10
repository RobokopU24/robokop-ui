import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useContext, useRef, useState } from "react";
import axios from "axios";
import NodeInputBox from "../../pages/explore/enrichment-analysis/NodeInputBox";
import BiolinkContext from "../../context/biolink";
import { Button, Container } from "@mui/material";
import { generateCsv, mkConfig, download } from "export-to-csv";

export const Route = createFileRoute("/explore/enrichment-analysis")({
  component: RouteComponent,
});

function RouteComponent() {
  return <EnrichedQueries />;
}

function generateEnrichmentQuery(
  inputNodeType: string,
  outputNodeType: string,
  inputCuries: string[],
  predicate: string,
  inputIsSubject = false
) {
  return {
    message: {
      query_graph: {
        nodes: {
          input: {
            categories: [inputNodeType],
            ids: ["uuid:1"],
            member_ids: inputCuries,
            set_interpretation: "MANY",
          },
          output: {
            categories: [outputNodeType],
          },
        },
        edges: {
          edge_0: {
            subject: inputIsSubject ? "input" : "output",
            object: inputIsSubject ? "output" : "input",
            predicates: [predicate],
            // knowledge_type: "inferred"
          },
        },
      },
    },
  };
}

function extractResultsStructured(resp: any) {
  const resultsArray = [];

  const results = resp.message.results || [];
  const kgNodes = resp.message.knowledge_graph.nodes || {};
  const kgEdges = resp.message.knowledge_graph.edges || {};

  for (const result of results) {
    const nb = result.node_bindings.output[0].id;
    const name = (Boolean(kgNodes[nb]) && kgNodes[nb].name) || "N/A";

    const edgeId = result.analyses[0].edge_bindings.edge_0[0].id;
    const edge = kgEdges[edgeId];
    let pValue = null;

    for (const att of edge.attributes || []) {
      if (att.attribute_type_id === "biolink:p_value") {
        pValue = att.value;
        break;
      }
    }

    resultsArray.push({
      id: nb,
      name,
      p_value: pValue,
    });
  }

  return resultsArray;
}

function EnrichedQueries() {
  const { concepts: categories, predicates } = useContext(BiolinkContext);

  const [curies, setCuries] = useState<string[]>([]);
  const [inputNodeType, setInputNodeType] = useState<string>("");
  const [inputNodeTaxa, setInputNodeTaxa] = useState<string>("");
  const [relationship, setRelationship] = useState<string>("related_to");
  const [outputType, setOutputType] = useState<string>("NamedThing");
  const [curieMode, setCurieMode] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>([]);

  function stopQuery() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
    setIsLoading(false);
  }

  async function startQuery() {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    const query = generateEnrichmentQuery(
      `biolink:${inputNodeType || "NamedThing"}`,
      `biolink:${outputType}`,
      curies,
      `biolink:${relationship}`
    );
    const { data } = await axios.post(
      "https://answercoalesce.renci.org/query",
      query,
      { signal: controller.signal }
    );
    setResults(extractResultsStructured(data));
    setIsLoading(false);
  }

  if (!categories?.length || !predicates?.length) {
    return <Container sx={{ my: 6 }}>Loading...</Container>;
  }

  return (
    <Container sx={{ my: 6 }}>
      <Link to="/explore">← View all tools</Link>
      <h1>Enrichment Analysis</h1>
      <p>
        This tool helps discover common connections between nodes. Given a list
        of input nodes, a relationship, and an output type, it will return a
        list of nodes that are best connected to the input nodes via the
        relationship.
      </p>

      <hr />
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", gap: "24px" }}>
            <Select
              label="Input node type (optional)"
              notSelectedOption="N/A"
              options={categories.map((c) => c.split(":")[1]).sort()}
              onChange={setInputNodeType}
              value={inputNodeType}
            />
            <div style={{ flex: "1" }}>
              <span
                style={{
                  fontSize: "14px",
                  color: "#626262",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  paddingLeft: "8px",
                }}
              >
                Input node taxa filter (optional, comma separated)
              </span>
              <input
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  border: "1px solid #9F9F9F",
                  borderRadius: "4px",
                }}
                value={inputNodeTaxa}
                onChange={(e) => setInputNodeTaxa(e.target.value)}
              />
            </div>
          </div>

          <label
            style={{
              fontSize: "14px",
              color: "#626262",
              textTransform: "uppercase",
              fontWeight: "bold",
              paddingLeft: "8px",
              display: "flex",
              alignItems: "start",
              gap: "8px",
              marginTop: "1rem",
            }}
            htmlFor="curie-input-mode"
          >
            CURIE input mode
            <input
              type="checkbox"
              id="curie-input-mode"
              checked={curieMode}
              onChange={(e) => setCurieMode(e.target.checked)}
            />
          </label>

          <NodeInputBox
            curieMode={curieMode}
            onCurieListChange={setCuries}
            inputNodeType={inputNodeType}
            inputNodeTaxa={inputNodeTaxa}
          />

          <div style={{ display: "flex", flexDirection: "row", gap: "24px" }}>
            <Select
              label="Relationship"
              options={predicates.map((p) => p.predicate.split(":")[1]).sort()}
              onChange={setRelationship}
              value={relationship}
            />
            <Select
              label="Output type"
              options={categories.map((c) => c.split(":")[1]).sort()}
              onChange={setOutputType}
              value={outputType}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Button
              disabled={curies.length === 0}
              onClick={isLoading ? stopQuery : startQuery}
              variant="contained"
              color={isLoading ? "secondary" : "primary"}
            >
              {isLoading ? "Stop Query" : "Submit Query"}
            </Button>

            {results.length > 0 && (
              <Button
                variant="contained"
                onClick={async () => {
                  const csvConfig = mkConfig({ useKeysAsHeaders: true, filename: 'enrichment_analysis_results' });
                  
                  const jsonToCsvString = (json: any) =>
                    generateCsv(csvConfig)(json);

                  const csvObj = results.map(({ id, name, p_value }: { id: string, name: string, p_value: number}) => [
                    id,
                    name,
                    p_value,
                  ]);
                  csvObj.unshift(["ID", "Name", "P-value"]);
                  const csvStr = jsonToCsvString(csvObj);

                  download(csvConfig)(csvStr);
                }}
              >
                Download results as CSV
              </Button>
            )}
          </div>

          {results.length > 0 && (
            <div>
              <h2>Results</h2>
              <table>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid ##ebebeb" }}>ID</th>
                    <th style={{ borderBottom: "1px solid ##ebebeb" }}>Name</th>
                    <th style={{ borderBottom: "1px solid ##ebebeb" }}>
                      P-value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results
                    .sort((a: { p_value: number }, b: { p_value: number }) => a.p_value - b.p_value)
                    .slice(0, 500)
                    .map(({ id, name, p_value }: { id: string, name: string, p_value: number}) => (
                      <tr key={`${id}-${name}-${p_value}`}>
                        <td>{id}</td>
                        <td>{name}</td>
                        <td>{p_value.toFixed(6)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

function Select({
  options,
  onChange,
  value,
  label,
  notSelectedOption,
}: {
  options: string[];
  onChange: React.Dispatch<React.SetStateAction<string>>;
  value: string | undefined;
  label: string;
  notSelectedOption?: string;
}) {
  return (
    <div style={{ flex: '1' }}>
      <span
        style={{
          fontSize: '14px',
          color: '#626262',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          paddingLeft: '8px',
        }}
      >
        {label}
      </span>
      <select
        style={{
          width: '100%',
          padding: '8px',
          fontSize: '16px',
          border: '1px solid #9F9F9F',
          borderRadius: '4px',
        }}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === notSelectedOption ? "" : v);
        }}
      >
        {(notSelectedOption ? [notSelectedOption, ...options] : options).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
