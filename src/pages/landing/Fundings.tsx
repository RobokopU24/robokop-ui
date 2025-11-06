import React from 'react';
import { Section } from './Section/Section';

function Fundings() {
  return (
    <Section title="Funding" index={3}>
      <p>
        ROBOKOP is a joint creation of the{' '}
        <a href="https://renci.org" target="_blank">
          Renaissance Computing Institute (RENCI)
        </a>{' '}
        at the{' '}
        <a href="https://www.unc.edu/" target="_blank">
          University of North Carolina at Chapel Hill
        </a>{' '}
        and{' '}
        <a href="https://covar.com/" target="_blank">
          CoVar LLC
        </a>
        . The prototype was developed with funding from the{' '}
        <a href="https://ncats.nih.gov/" target="_blank">
          National Center for Advancing Translational Sciences
        </a>
        ,{' '}
        <a href="https://www.nih.gov/" target="_blank">
          National Institutes of Health
        </a>{' '}
        (award{' '}
        <a
          href="https://taggs.hhs.gov/Detail/AwardDetail?arg_AwardNum=OT2TR002514&arg_ProgOfficeCode=264"
          target="_blank"
        >
          #OT2TR002514
        </a>
        ). ROBOKOP&apos;s continued development is supported with joint funding from the{' '}
        <a
          href="https://reporter.nih.gov/search/ALIFnrPqJU6PEtxDUvY9EA/project-details/10697371?"
          target="_blank"
        >
          National Institute of Environmental Health Sciences
        </a>{' '}
        and the{' '}
        <a href="https://datascience.nih.gov/about/odss" target="_blank">
          Office of Data Science Strategy
        </a>{' '}
        within the{' '}
        <a href="https://www.nih.gov/" target="_blank">
          National Institutes of Health
        </a>{' '}
        (award{' '}
        <a
          href="https://tools.niehs.nih.gov/portfolio/index.cfm?do=portfolio.grantDetail&grant_number=U24ES035214"
          target="_blank"
        >
          #U24ES035214
        </a>
        ).
      </p>
    </Section>
  );
}

export default Fundings;
