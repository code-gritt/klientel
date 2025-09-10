import { Container, Navbar } from '@/components';
import Sidebar from '@/components/sidebar';
import LeadChart from '@/components/lead-chart';

export default function Analytics() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <Container className="flex-1">
          <h1 className="text-3xl font-semibold mb-6">Analytics</h1>
          <LeadChart />
        </Container>
      </div>
    </>
  );
}
