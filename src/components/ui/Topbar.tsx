interface TopbarProps {
  left?: React.ReactNode
  right?: React.ReactNode
}

export default function Topbar({ left, right }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-white/[0.08] bg-background/80 backdrop-blur-md px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">{left}</div>
      <div className="flex items-center gap-4">{right}</div>
    </header>
  )
}
