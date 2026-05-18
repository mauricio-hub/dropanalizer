'use client'

import { useEffect, useState } from 'react'
import ProposalLanding from '@/components/ProposalLanding'
import type { ProposalContent, DropshippingContent } from '@/types'

interface PreviewShellProps {
  proposal: {
    id: string
    title: string
    template?: string
    createdAt: string
    images?: { url: string; order: number }[]
    buyUrl?: string
  }
  initialContent: ProposalContent | DropshippingContent
  initialVersionId: string
}

export default function PreviewShell({ proposal, initialContent, initialVersionId }: PreviewShellProps) {
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'PROPLY_PREVIEW_UPDATE') {
        setContent(event.data.content)
      }
    }
    window.addEventListener('message', handleMessage)
    // Signal to the parent that the iframe is ready
    window.parent.postMessage({ type: 'PROPLY_PREVIEW_READY' }, '*')
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <ProposalLanding
      proposal={proposal}
      version={{ id: initialVersionId, content }}
    />
  )
}
