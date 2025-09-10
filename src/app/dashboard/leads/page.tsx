import { Container, Navbar } from '@/components';
import Sidebar from '@/components/sidebar';
import LeadTable from '@/components/lead-table';

export default function Leads() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <Container className="flex-1">
          <h1 className="text-3xl font-semibold mb-6">Leads</h1>
          <LeadTable />
        </Container>
      </div>
    </>
  );
}
