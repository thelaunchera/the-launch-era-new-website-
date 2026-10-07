import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/es')({
  component: SpanishLayout,
});

function SpanishLayout(){
  return <Outlet />;
}
