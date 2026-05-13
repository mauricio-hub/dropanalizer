import Link from 'next/link'
import { FileText, BarChart2, GitBranch, Zap } from 'lucide-react'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function Home() {
  const { userId } = auth()
  if (userId) redirect('/dashboard')
  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/[0.08] bg-background/80 backdrop-blur-md px-6">
        <span className="text-base font-semibold tracking-tight">
          Pro<span className="text-accent">ply</span>
        </span>
        <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="#how" className="hover:text-text-primary transition-colors">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-hover shadow-glow-green-sm hover:shadow-glow-green transition-all"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.08)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent mb-6">
            <Zap className="h-3 w-3" />
            AI-powered proposals
          </div>
          <h1 className="max-w-3xl text-4xl md:text-6xl font-semibold tracking-tight text-text-primary leading-[1.1]">
            Close deals faster with{' '}
            <span className="text-accent">smart proposals</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-secondary leading-relaxed">
            Create professional commercial proposals as dynamic landing pages.
            Track client behavior and iterate with AI to win more deals.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-base font-semibold text-background hover:bg-accent-hover shadow-glow-green-sm hover:shadow-glow-green transition-all"
            >
              Start for free →
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-base font-medium text-text-primary hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/[0.06] mx-6" />

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Features</p>
        <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-12">
          Everything you need to close deals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/[0.08] bg-surface p-6 shadow-card hover:border-white/[0.14] hover:shadow-glow-green-sm transition-all"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">How it works</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-12">
            From brief to closed deal
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="flex gap-4">
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-accent/30 text-accent text-sm font-semibold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{s.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="relative overflow-hidden rounded-2xl border border-accent/10 bg-surface p-10 md:p-16 text-center shadow-card">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.06)_0%,transparent_70%)]" />
            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-semibold text-text-primary mb-4">
                Ready to send better proposals?
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Join freelancers and agencies who close deals faster with Proply.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3 text-base font-semibold text-background hover:bg-accent-hover shadow-glow-green hover:shadow-glow-green transition-all"
              >
                Get started for free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-sm text-text-muted">
          <span>Pro<span className="text-accent">ply</span></span>
          <span>© {new Date().getFullYear()} Proply</span>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: FileText,
    title: 'Create Proposals',
    description: 'Generate professional proposals in minutes with AI assistance.',
  },
  {
    icon: BarChart2,
    title: 'Track Behavior',
    description: 'See how clients interact with your proposal in real time.',
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Create and compare optimized versions of every proposal.',
  },
  {
    icon: Zap,
    title: 'AI Optimization',
    description: 'Get AI-powered suggestions to improve your close rate.',
  },
]

const steps = [
  {
    title: 'Write your brief',
    description: 'Describe your service, scope, and pricing in plain text.',
  },
  {
    title: 'AI structures it',
    description: 'Proply turns your brief into a polished, structured proposal.',
  },
  {
    title: 'Send & track',
    description: 'Share a link and watch your client engage with every section.',
  },
]
