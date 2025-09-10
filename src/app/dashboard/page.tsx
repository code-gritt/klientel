import { Container, Navbar } from '@/components';

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <Container className="flex items-center justify-center py-20">
        <h1 className="text-3xl font-semibold">Welcome to Your Dashboard</h1>
      </Container>
    </>
  );
}
