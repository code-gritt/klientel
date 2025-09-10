import { Container, Navbar } from '@/components';
import Sidebar from '@/components/sidebar';
import PipelineBoard from '@/components/pipeline-board';

export default function Pipelines() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <Container className="flex-1 py-6 md:pl-64">
          <h1 className="text-3xl font-semibold mb-6">Pipelines</h1>
          <PipelineBoard />
        </Container>
      </div>
    </>
  );
}
