'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/team-store';
import { toast } from 'react-hot-toast';
import { LoaderFour } from '@/components/ui/loader';

export default function AcceptInvite({ params }: { params: { id: string } }) {
  const { acceptInvite } = useTeamStore();
  const router = useRouter();

  useEffect(() => {
    acceptInvite(params.id)
      .then(() => {
        toast.success('Invitation accepted');
        router.push('/dashboard');
      })
      .catch((err) => {
        toast.error(err.message);
        router.push('/dashboard');
      });
  }, [acceptInvite, params.id, router]);

  return <LoaderFour />;
}
