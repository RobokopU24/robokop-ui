import { Section } from './Section/Section';

function Events() {
  return (
    <Section title="Events" index={5}>
      <p>
        ROBOKOP has weekly office hours from 10-11am EST.{' '}
        <a
          href="https://outlook.office365.com/owa/calendar/f78771fc86a544fa87ba0c0d3e2eb20e@renci.org/f584171e733046f88746dc0c2d605b3815090452925078675798/calendar.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          View details on our calendar
        </a>{' '}
        or subscribe with the{' '}
        <a href="https://outlook.office365.com/owa/calendar/f78771fc86a544fa87ba0c0d3e2eb20e@renci.org/f584171e733046f88746dc0c2d605b3815090452925078675798/calendar.ics">
          ICS file
        </a>
        .
      </p>
    </Section>
  );
}

export default Events;
