import { createFileRoute } from '@tanstack/react-router';
import LandingPage from '../pages/landing';

export const Route = createFileRoute('/')({
  component: Home,
  ssr: true,
});

function Home() {
  return <LandingPage />;
}
