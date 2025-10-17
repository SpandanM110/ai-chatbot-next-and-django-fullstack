'use client';

import { useParams } from 'next/navigation';
import SharedChatViewer from '@/components/SharedChatViewer';

export default function SharedChatPage() {
  const params = useParams();
  const shareToken = params.token as string;

  return <SharedChatViewer shareToken={shareToken} />;
}
