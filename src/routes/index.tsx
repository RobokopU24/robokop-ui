import { createFileRoute } from '@tanstack/react-router';
import LandingPage from '../pages/landing';

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      {
        title: 'ROBOKOP',
      },
    ],
  }),
});

function Home() {
  return <LandingPage />;
}
