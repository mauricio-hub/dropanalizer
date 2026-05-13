interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-surface rounded-xl border border-white/[0.08] shadow-card
        ${hover ? 'hover:border-white/[0.14] hover:shadow-glow-green-sm transition-all cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
