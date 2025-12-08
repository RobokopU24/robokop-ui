import { CitationList } from './CitationList/CitationList';
import { Section } from './Section/Section';

function Citations() {
  return (
    <Section title="Citations" index={2}>
      <p>If you use ROBOKOP in your work, please cite the following papers:</p>
      <CitationList>
        <li>
          Bizon C, Cox S, Balhoff J, Kebede Y, Wang P, Morton K, Fecho K, Tropsha A. ROBOKOP KG and
          KGB: integrated knowledge graphs from federated sources. J Chem Inf Model 2019 Dec
          23;59(12):4968–4973. doi: 10.1021/acs.jcim.9b00683.{' '}
          <a href="https://pubmed.ncbi.nlm.nih.gov/31769676/" target="_blank">
            https://pubmed.ncbi.nlm.nih.gov/31769676/
          </a>
          .
        </li>
        <li>
          Morton K, Wang P, Bizon C, Cox S, Balhoff J, Kebede Y, Fecho K, Tropsha A. ROBOKOP: an
          abstraction layer and user interface for knowledge graphs to support question answering.
          Bioinformatics 2019;pii:btz604. doi: 10.1093/bioinformatics/btz604.{' '}
          <a href="https://pubmed.ncbi.nlm.nih.gov/31410449/" target="_blank">
            https://pubmed.ncbi.nlm.nih.gov/31410449/
          </a>
          .
        </li>
      </CitationList>
    </Section>
  );
}

export default Citations;
