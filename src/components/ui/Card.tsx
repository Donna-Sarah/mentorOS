'use client'

import { cn } from '@/lib/utils/cn'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'bg-white-canvas rounded-md shadow-card p-4',
        onClick && 'cursor-pointer hover:shadow-modal transition-shadow',
        className,
      )}
    >
      {children}
    </div>
  )
}
