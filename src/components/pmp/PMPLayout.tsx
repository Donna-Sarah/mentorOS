'use client'

import { useRef, useState } from 'react'
import PMPClient, { type PMPClientHandle } from './PMPClient'
import PMPSidebar from './PMPSidebar'

type SidebarActiveItem = 'mood1' | 'mood2' | 'upload' | 'glossary' | 'evm' | null

export default function PMPLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState<SidebarActiveItem>(null)
  const pmpClientRef = useRef<PMPClientHandle | null>(null)

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-amber-glow md:min-h-[calc(100vh-64px)]">
      <div className="sticky top-[56px] hidden h-[calc(100vh-56px)] shrink-0 overflow-y-auto lg:flex lg:flex-col md:top-[64px] md:h-[calc(100vh-64px)]">
        <PMPSidebar
          activeItem={activeItem}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onSelectMood1={() => {
            setActiveItem('mood1')
            pmpClientRef.current?.startWithMood('mood1')
          }}
          onSelectMood2={() => {
            setActiveItem('mood2')
            pmpClientRef.current?.startWithMood('mood2')
          }}
          onScrollToUpload={() => {
            setActiveItem('upload')
            pmpClientRef.current?.scrollToUpload()
          }}
          onOpenGlossary={() => {
            setActiveItem('glossary')
            pmpClientRef.current?.openGlossary()
          }}
          onOpenEVM={() => {
            setActiveItem('evm')
            pmpClientRef.current?.openEVM()
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <PMPClient ref={pmpClientRef} onReturnToInput={() => setActiveItem(null)} />
      </div>
    </div>
  )
}
