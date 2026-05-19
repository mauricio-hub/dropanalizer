import { describe, it, expect } from 'vitest'
import { generateSignals } from '@/lib/recommendations'

const now = new Date()
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

describe('generateSignals — sin tráfico', () => {
  it('retorna señal info para compartir cuando hay menos de 10 visitas', () => {
    const signals = generateSignals({
      totalViews: 5,
      buyIntentClicks: 0,
      totalClicks: 0,
      avgTimeOnPage: 30,
      benefitsClicks: 0,
      createdAt: daysAgo(3),
      language: 'es',
    })
    expect(signals).toHaveLength(1)
    expect(signals[0].severity).toBe('info')
    expect(signals[0].actionType).toBe('share_link')
  })

  it('funciona en inglés', () => {
    const signals = generateSignals({
      totalViews: 2,
      buyIntentClicks: 0,
      totalClicks: 0,
      avgTimeOnPage: 30,
      benefitsClicks: 0,
      createdAt: daysAgo(1),
      language: 'en',
    })
    expect(signals[0].actionLabel).toBe('Copy link')
  })
})

describe('generateSignals — muy pronto para concluir', () => {
  it('retorna info cuando es día 1 y hay pocas visitas', () => {
    const signals = generateSignals({
      totalViews: 20,
      buyIntentClicks: 0,
      totalClicks: 0,
      avgTimeOnPage: 30,
      benefitsClicks: 2,
      createdAt: now,
      language: 'es',
    })
    expect(signals).toHaveLength(1)
    expect(signals[0].severity).toBe('info')
  })
})

describe('generateSignals — buena conversión', () => {
  it('retorna success cuando CTR >= 5% con suficientes visitas', () => {
    const signals = generateSignals({
      totalViews: 100,
      buyIntentClicks: 10, // 10% CTR
      totalClicks: 15,
      avgTimeOnPage: 60,
      benefitsClicks: 5,
      createdAt: daysAgo(5),
      language: 'es',
    })
    expect(signals).toHaveLength(1)
    expect(signals[0].severity).toBe('success')
    expect(signals[0].actionType).toBe('share_link')
  })
})

describe('generateSignals — CTR crítico', () => {
  it('retorna critical new_version cuando CTR < 1% con 50+ visitas y 3+ días', () => {
    const signals = generateSignals({
      totalViews: 60,
      buyIntentClicks: 0,
      totalClicks: 1,
      avgTimeOnPage: 30,
      benefitsClicks: 2,
      createdAt: daysAgo(4),
      language: 'es',
    })
    const critical = signals.find(s => s.severity === 'critical')
    expect(critical).toBeDefined()
    expect(critical?.actionType).toBe('new_version')
  })

  it('retorna critical change_product cuando hay 100+ visitas y 5+ días sin conversión', () => {
    const signals = generateSignals({
      totalViews: 120,
      buyIntentClicks: 0,
      totalClicks: 1,
      avgTimeOnPage: 30,
      benefitsClicks: 2,
      createdAt: daysAgo(6),
      language: 'es',
    })
    const critical = signals.find(s => s.actionType === 'change_product')
    expect(critical).toBeDefined()
    expect(critical?.severity).toBe('critical')
  })

  it('no duplica critical cuando ya hay change_product', () => {
    const signals = generateSignals({
      totalViews: 120,
      buyIntentClicks: 0,
      totalClicks: 1,
      avgTimeOnPage: 30,
      benefitsClicks: 2,
      createdAt: daysAgo(8),
      language: 'es',
    })
    const newVersionCriticals = signals.filter(
      s => s.actionType === 'new_version' && s.severity === 'critical'
    )
    expect(newVersionCriticals).toHaveLength(0)
  })
})

describe('generateSignals — warnings', () => {
  it('retorna warning cuando CTR está entre 1% y 3%', () => {
    const signals = generateSignals({
      totalViews: 100,
      buyIntentClicks: 2, // 2% CTR
      totalClicks: 5,
      avgTimeOnPage: 30,
      benefitsClicks: 3,
      createdAt: daysAgo(4),
      language: 'es',
    })
    const warning = signals.find(s => s.actionType === 'edit_content' && s.severity === 'warning')
    expect(warning).toBeDefined()
  })

  it('retorna warning de bounce cuando avgTimeOnPage < 10s con 30+ visitas', () => {
    const signals = generateSignals({
      totalViews: 50,
      buyIntentClicks: 1,
      totalClicks: 2,
      avgTimeOnPage: 5,
      benefitsClicks: 0,
      createdAt: daysAgo(4),
      language: 'es',
    })
    const bounce = signals.find(s => s.title.includes('rápido') || s.title.includes('quickly'))
    expect(bounce).toBeDefined()
    expect(bounce?.severity).toBe('warning')
  })

  it('retorna warning cuando nadie lee beneficios con 50+ visitas', () => {
    const signals = generateSignals({
      totalViews: 60,
      buyIntentClicks: 1,
      totalClicks: 2,
      avgTimeOnPage: 30,
      benefitsClicks: 0,
      createdAt: daysAgo(4),
      language: 'es',
    })
    const benefitsWarning = signals.find(s => s.actionType === 'edit_content' && s.title.includes('beneficio'))
    expect(benefitsWarning).toBeDefined()
  })
})

describe('generateSignals — página envejecida', () => {
  it('retorna critical cuando lleva 7+ días con CTR < 2%', () => {
    const signals = generateSignals({
      totalViews: 50,
      buyIntentClicks: 0,
      totalClicks: 1,
      avgTimeOnPage: 30,
      benefitsClicks: 2,
      createdAt: daysAgo(10),
      language: 'es',
    })
    const aged = signals.find(s => s.severity === 'critical' && s.actionType === 'new_version')
    expect(aged).toBeDefined()
  })
})
