import { Section } from './Section/Section';

function License() {
  return (
    <Section title="License" index={4}>
      <p>
        The ROBOKOP system and the ROBOKOP knowledge graph &quot;KG&quot; are governed under an
        open-source{' '}
        <a href="https://opensource.org/license/mit/" target="_blank">
          MIT License
        </a>
        . Both resources make use of open-source primary data sources. While we make every effort to
        ensure that those sources can be freely ingested and redistributed, we encourage users to
        review and comply with the specific license terms applicable to each source. Furthermore,
        copyright remains with the respective originators, contributors, and maintainers of the
        primary data sources. This resource does not claim ownership of such intellectual property
        unless explicitly stated. The open-source ROBOKOP system, including the ROBOKOP KG, is
        provided &quot;as is,&quot; without warranties or guarantees of any kind. The creators,
        maintainers, and distributors of the original primary data sources and derivative works
        disclaim any liability for errors, omissions, or misuse of the data. Users assume all
        responsibility for ensuring that the data sources are suitable for their specific
        applications and comply with all applicable legal and ethical guidelines.
      </p>
    </Section>
  );
}

export default License;
