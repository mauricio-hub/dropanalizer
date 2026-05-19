'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import { Sparkles, Check, Rocket, Flame, Upload, X, AlertCircle, MessageCircle, Link, ExternalLink, Brain, Wand2, BarChart2, Zap } from 'lucide-react'
import type { CtaDestination } from '@/components/CtaDestinations'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'
import { AnimatePresence, motion } from 'framer-motion'

interface UploadedImage {
  url: string
  publicId: string
  file?: File
}

interface CloudinaryResponse {
  secure_url: string
  public_id: string
}

export default function NewProposalPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = getTranslation(language)

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Template, Landing Style & Audience Language
  const [template, setTemplate] = useState<'producto_nuevo' | 'oferta_limitada' | null>(null)
  const [landingStyle, setLandingStyle] = useState<'luxury' | 'minimalist' | 'vibrant'>('luxury')
  const [audienceLang, setAudienceLang] = useState<'es' | 'en'>('es')

  // Step 2: Product info
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  // CTA destination
  const [ctaDestinations, setCtaDestinations] = useState<CtaDestination[]>([])
  const [selectedCtaId, setSelectedCtaId] = useState<string>('')

  // Step 3: Generation
  const [generationProgress, setGenerationProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    fetch('/api/cta-destinations')
      .then(r => r.json())
      .then(data => {
        setCtaDestinations(data)
        if (data.length > 0) setSelectedCtaId(data[0].id)
      })
      .catch(() => {})
  }, [])

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''

  // Simulate generation progress animation
  useEffect(() => {
    if (step === 3 && loading) {
      setActiveStep(0)
      const stepDurations = [1200, 2000, 1800, 1000]
      let current = 0
      const timers: ReturnType<typeof setTimeout>[] = []

      stepDurations.forEach((delay, i) => {
        const accumulated = stepDurations.slice(0, i).reduce((a, b) => a + b, 0)
        const t = setTimeout(() => {
          setActiveStep(i)
          setGenerationProgress(Math.min(95, ((i + 1) / stepDurations.length) * 95))
        }, accumulated)
        timers.push(t)
      })

      return () => timers.forEach(clearTimeout)
    }
  }, [step, loading])

  // Trigger generation when step becomes 3
  useEffect(() => {
    if (step === 3 && !loading) {
      handleCreateProposal()
    }
  }, [step])

  const generationSteps = [
    t.createProposal.generationStep1,
    t.createProposal.generationStep2,
    t.createProposal.generationStep3,
    t.createProposal.generationStep4,
  ]

  const currentGenerationText = generationSteps[Math.floor((generationProgress / 100) * generationSteps.length) % generationSteps.length]

  async function uploadImageToCloudinary(file: File): Promise<CloudinaryResponse | null> {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setImageError(t.createProposal.errorImageSize)
      return null
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      setImageError(t.createProposal.errorImageFormat)
      return null
    }

    setUploadingImage(true)
    setImageError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', cloudinaryUploadPreset)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = (await res.json()) as CloudinaryResponse
      return data
    } catch (err) {
      setImageError(t.createProposal.errorImageUpload)
      console.error('Upload error:', err)
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files
    if (!files) return

    // Check total count
    if (images.length + files.length > 5) {
      setImageError(t.createProposal.errorMaxImages)
      return
    }

    // Upload each file
    Array.from(files).forEach((file) => {
      uploadImageToCloudinary(file).then((result) => {
        if (result) {
          setImages((prev) => [
            ...prev,
            { url: result.secure_url, publicId: result.public_id },
          ])
        }
      })
    })
  }

  function removeImage(publicId: string) {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId))
  }

  function buildBuyUrl(): string {
    const dest = ctaDestinations.find(d => d.id === selectedCtaId)
    if (!dest) return ''
    if (dest.type === 'whatsapp') {
      const msg = encodeURIComponent(`Hola, quiero comprar ${productName}`)
      return `${dest.value}?text=${msg}`
    }
    return dest.value
  }

  function canProceedStep2(): boolean {
    return (
      productName.trim().length > 0 &&
      price.trim().length > 0 &&
      !isNaN(parseFloat(price)) &&
      parseFloat(price) >= 0 &&
      images.length > 0 &&
      !uploadingImage &&
      selectedCtaId.length > 0
    )
  }

  async function handleCreateProposal() {
    if (!template || images.length === 0) return

    setLoading(true)
    setError('')
    setGenerationProgress(0)
    setActiveStep(0)

    try {
      // Prepare image data
      const imageData = images.map((img) => ({
        url: img.url,
        publicId: img.publicId,
      }))

      // Parse originalPrice if present
      const originalPriceNum = template === 'oferta_limitada' && originalPrice.trim()
        ? parseFloat(originalPrice)
        : undefined

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim(),
          price: parseFloat(price),
          currency,
          template,
          landingStyle,
          audienceLang,
          description: description.trim() || undefined,
          images: imageData,
          buyUrl: buildBuyUrl(),
          generateWithAI: true,
        }),
      })

      setGenerationProgress(100)
      setActiveStep(4)

      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'free_limit_reached') {
          setError(t.createProposal.errorFreeLimitReached)
        } else {
          setError(data.error || t.createProposal.errorCreate)
        }
        setLoading(false)
        setStep(2)
        return
      }

      const proposal = await res.json()

      // Wait a bit for the visual effect
      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push(`/proposals/${proposal.id}/edit`)
    } catch (err) {
      setError(t.createProposal.errorCreate)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container className="max-w-2xl">
        <PageHeader
          title={t.createProposal.title}
          subtitle={t.createProposal.subtitle}
        />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-8"
            >
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  {t.createProposal.step1Title}
                </h2>

                {/* Template Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Producto Nuevo */}
                  <button
                    onClick={() => setTemplate('producto_nuevo')}
                    type="button"
                    className={`group rounded-xl border-2 p-6 transition-all ${
                      template === 'producto_nuevo'
                        ? 'border-accent bg-accent/10'
                        : 'border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="space-y-3">
                      <Rocket className={`h-8 w-8 ${template === 'producto_nuevo' ? 'text-accent' : 'text-text-muted'}`} />
                      <div className="text-left">
                        <h3 className="font-semibold text-text-primary">{t.createProposal.productNew}</h3>
                        <p className="text-sm text-text-muted mt-1">
                          {t.createProposal.productNewDesc}
                        </p>
                      </div>
                      {template === 'producto_nuevo' && (
                        <div className="flex items-center gap-2 pt-2">
                          <Check className="h-4 w-4 text-accent" />
                          <span className="text-sm text-accent">{t.createProposal.selected}</span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Oferta Limitada */}
                  <button
                    onClick={() => setTemplate('oferta_limitada')}
                    type="button"
                    className={`group rounded-xl border-2 p-6 transition-all ${
                      template === 'oferta_limitada'
                        ? 'border-accent bg-accent/10'
                        : 'border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="space-y-3">
                      <Flame className={`h-8 w-8 ${template === 'oferta_limitada' ? 'text-accent' : 'text-text-muted'}`} />
                      <div className="text-left">
                        <h3 className="font-semibold text-text-primary">{t.createProposal.limitedOffer}</h3>
                        <p className="text-sm text-text-muted mt-1">
                          {t.createProposal.limitedOfferDesc}
                        </p>
                      </div>
                      {template === 'oferta_limitada' && (
                        <div className="flex items-center gap-2 pt-2">
                          <Check className="h-4 w-4 text-accent" />
                          <span className="text-sm text-accent">{t.createProposal.selected}</span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {template && (
                  <div className="mt-8 space-y-4 border-t border-white/[0.08] pt-8">
                    <h2 className="text-lg font-semibold text-text-primary">
                      {t.createProposal.styleTitle}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {t.createProposal.styleSubtitle}
                    </p>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Luxury */}
                      <button
                        onClick={() => setLandingStyle('luxury')}
                        type="button"
                        className={`rounded-lg border-2 p-4 transition-all text-left ${
                          landingStyle === 'luxury'
                            ? 'border-accent bg-accent/10'
                            : 'border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="font-semibold text-text-primary mb-1">{t.createProposal.styleLuxury}</div>
                        <p className="text-xs text-text-muted">{t.createProposal.styleLuxuryDesc}</p>
                        {landingStyle === 'luxury' && (
                          <Check className="h-4 w-4 text-accent mt-2" />
                        )}
                      </button>

                      {/* Minimalist */}
                      <button
                        onClick={() => setLandingStyle('minimalist')}
                        type="button"
                        className={`rounded-lg border-2 p-4 transition-all text-left ${
                          landingStyle === 'minimalist'
                            ? 'border-accent bg-accent/10'
                            : 'border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="font-semibold text-text-primary mb-1">{t.createProposal.styleMinimalist}</div>
                        <p className="text-xs text-text-muted">{t.createProposal.styleMinimalistDesc}</p>
                        {landingStyle === 'minimalist' && (
                          <Check className="h-4 w-4 text-accent mt-2" />
                        )}
                      </button>

                      {/* Vibrant */}
                      <button
                        onClick={() => setLandingStyle('vibrant')}
                        type="button"
                        className={`rounded-lg border-2 p-4 transition-all text-left ${
                          landingStyle === 'vibrant'
                            ? 'border-accent bg-accent/10'
                            : 'border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="font-semibold text-text-primary mb-1">{t.createProposal.styleVibrant}</div>
                        <p className="text-xs text-text-muted">{t.createProposal.styleVibrantDesc}</p>
                        {landingStyle === 'vibrant' && (
                          <Check className="h-4 w-4 text-accent mt-2" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {template && (
                  <div className="mt-6 space-y-4 border-t border-white/[0.08] pt-6">
                    <h2 className="text-lg font-semibold text-text-primary">
                      {t.createProposal.audienceTitle}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {t.createProposal.audienceSubtitle}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <button
                        onClick={() => setAudienceLang('es')}
                        type="button"
                        className={`rounded-lg border-2 p-4 transition-all text-left ${
                          audienceLang === 'es'
                            ? 'border-accent bg-accent/10'
                            : 'border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="text-2xl mb-1">🇪🇸</div>
                        <div className="font-semibold text-text-primary mb-1">Español</div>
                        <p className="text-xs text-text-muted">{t.createProposal.audienceEsDesc}</p>
                        {audienceLang === 'es' && <Check className="h-4 w-4 text-accent mt-2" />}
                      </button>
                      <button
                        onClick={() => setAudienceLang('en')}
                        type="button"
                        className={`rounded-lg border-2 p-4 transition-all text-left ${
                          audienceLang === 'en'
                            ? 'border-accent bg-accent/10'
                            : 'border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="text-2xl mb-1">🇺🇸</div>
                        <div className="font-semibold text-text-primary mb-1">English</div>
                        <p className="text-xs text-text-muted">For US, UK and global audiences</p>
                        {audienceLang === 'en' && <Check className="h-4 w-4 text-accent mt-2" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                  >
                    {t.createProposal.cancel}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!template}
                  >
                    {t.createProposal.continue}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-8 space-y-6"
            >
              {/* Progress dots */}
              <div className="flex gap-2 justify-center">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <div className="h-2 w-2 rounded-full bg-accent" />
                <div className="h-2 w-2 rounded-full bg-text-muted/30" />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {imageError && (
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                  <p className="text-sm text-orange-400">{imageError}</p>
                </div>
              )}

              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-secondary">
                  {t.createProposal.productName}
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={t.createProposal.productNamePlaceholder}
                  className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>

              {/* Price & Currency */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-secondary">{t.createProposal.price}</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99.99"
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-secondary">{t.createProposal.currency}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="MXN">MXN</option>
                    <option value="ARS">ARS</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
              </div>

              {/* Original Price (only for Oferta Limitada) */}
              {template === 'oferta_limitada' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-secondary">
                    {t.createProposal.originalPrice}
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder={t.createProposal.originalPricePlaceholder}
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-text-secondary">
                  {t.createProposal.uploadImages}
                </label>

                {/* Upload Zone */}
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleImageSelect}
                    disabled={uploadingImage || images.length >= 5}
                    className="hidden"
                    id="image-input"
                  />
                  <label
                    htmlFor="image-input"
                    className="block rounded-xl border-2 border-dashed border-white/[0.15] bg-surface/50 p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-surface/80 transition-all"
                  >
                    <Upload className="h-8 w-8 text-text-muted mx-auto mb-2" />
                    <p className="text-sm font-medium text-text-primary">
                      {t.createProposal.dragOrClick}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {t.createProposal.imageFormatFull}
                    </p>
                    {uploadingImage && (
                      <p className="text-xs text-accent mt-2 animate-pulse">
                        {t.createProposal.imageUploading}
                      </p>
                    )}
                  </label>
                </div>

                {/* Image Thumbnails */}
                {images.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.publicId}
                        className="relative group rounded-lg overflow-hidden bg-surface border border-white/[0.08]"
                      >
                        <img
                          src={img.url}
                          alt={`Imagen ${idx + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-accent text-background text-xs font-semibold px-2 py-1 rounded">
                            {t.createProposal.imagesPrimary}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(img.publicId)}
                          className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-text-muted">
                  {images.length}/5 {t.createProposal.imagesUploaded}
                </p>
              </div>

              {/* CTA Destination */}
              <div className="space-y-3 border-t border-white/[0.08] pt-6">
                <label className="text-sm font-semibold text-text-secondary">
                  {t.createProposal.ctaTitle}
                </label>

                {ctaDestinations.length === 0 ? (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex gap-3 items-start">
                    <AlertCircle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-orange-300 font-medium">{t.createProposal.ctaNone}</p>
                      <p className="text-xs text-orange-400/70 mt-1">
                        {t.createProposal.ctaNoneDesc}
                      </p>
                      <a
                        href="/dashboard"
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200 mt-2 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t.createProposal.ctaNoneLink}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* WhatsApp group */}
                    {ctaDestinations.filter(d => d.type === 'whatsapp').length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-400 flex items-center gap-1 mb-2">
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </p>
                        <div className="space-y-1">
                          {ctaDestinations.filter(d => d.type === 'whatsapp').map(d => {
                            const label = d.name || (d.value.match(/wa\.me\/\+?(\d+)/)?.[1] ? `+${d.value.match(/wa\.me\/\+?(\d+)/)?.[1]}` : d.value)
                            const sub = d.name ? (d.value.match(/wa\.me\/\+?(\d+)/)?.[1] ? `+${d.value.match(/wa\.me\/\+?(\d+)/)?.[1]}` : '') : ''
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => setSelectedCtaId(d.id)}
                                className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                                  selectedCtaId === d.id
                                    ? 'border-accent bg-accent/10'
                                    : 'border-white/[0.08] hover:border-white/[0.15]'
                                }`}
                              >
                                <span className="text-sm font-medium text-text-primary">{label}</span>
                                {sub && <span className="text-xs text-text-muted ml-2">{sub}</span>}
                                {selectedCtaId === d.id && <Check className="h-4 w-4 text-accent float-right mt-0.5" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Link group */}
                    {ctaDestinations.filter(d => d.type === 'link').length > 0 && (
                      <div className={ctaDestinations.filter(d => d.type === 'whatsapp').length > 0 ? 'mt-4' : ''}>
                        <p className="text-xs font-semibold text-blue-400 flex items-center gap-1 mb-2">
                          <Link className="h-3 w-3" /> {t.createProposal.ctaLinksGroup}
                        </p>
                        <div className="space-y-1">
                          {ctaDestinations.filter(d => d.type === 'link').map(d => {
                            let sub = ''
                            try { sub = new URL(d.value).hostname } catch {}
                            const label = d.name || sub || d.value
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => setSelectedCtaId(d.id)}
                                className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                                  selectedCtaId === d.id
                                    ? 'border-accent bg-accent/10'
                                    : 'border-white/[0.08] hover:border-white/[0.15]'
                                }`}
                              >
                                <span className="text-sm font-medium text-text-primary">{label}</span>
                                {d.name && sub && <span className="text-xs text-text-muted ml-2">{sub}</span>}
                                {selectedCtaId === d.id && <Check className="h-4 w-4 text-accent float-right mt-0.5" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold text-text-secondary hover:text-accent transition-colors">
                    ✓ {t.createProposal.contextOptional}
                  </summary>
                  <div className="pt-3">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t.createProposal.contextPlaceholder}
                      rows={4}
                      className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
                    />
                  </div>
                </details>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  disabled={loading || uploadingImage}
                >
                  {t.createProposal.back}
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2()}
                  className={!canProceedStep2() ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {t.createProposal.generateLanding}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-8 space-y-6"
            >
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                  {!loading && (
                    <Button
                      type="button"
                      onClick={handleCreateProposal}
                      className="text-sm"
                    >
                      {t.createProposal.tryAgain}
                    </Button>
                  )}
                </div>
              )}

              {!error && (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <div className="relative inline-flex items-center justify-center w-14 h-14">
                      <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping" />
                      <div className="relative rounded-full bg-accent/20 p-3">
                        <Brain className="h-7 w-7 text-accent" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {t.createProposal.generationStep1.replace('...', '')}
                    </h3>
                    <p className="text-sm text-text-muted">{t.createProposal.takingSeconds}</p>
                  </div>

                  {/* Steps */}
                  <div className="rounded-xl border border-white/[0.08] bg-surface/60 p-5 space-y-4">
                    {[
                      { icon: Brain, label: t.createProposal.generationStep1 },
                      { icon: Wand2, label: t.createProposal.generationStep2 },
                      { icon: BarChart2, label: t.createProposal.generationStep3 },
                      { icon: Zap, label: t.createProposal.generationStep4 },
                    ].map((s, i) => {
                      const isDone = i < activeStep
                      const isActive = i === activeStep
                      const isPending = i > activeStep

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.3 }}
                          className="flex items-center gap-4"
                        >
                          {/* Icon bubble */}
                          <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 ${
                            isDone
                              ? 'bg-accent/20'
                              : isActive
                              ? 'bg-accent/15 ring-1 ring-accent/40'
                              : 'bg-white/[0.04]'
                          }`}>
                            {isDone ? (
                              <Check className="h-4 w-4 text-accent" />
                            ) : (
                              <s.icon className={`h-4 w-4 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                            )}
                          </div>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium transition-colors duration-300 ${
                              isDone ? 'text-accent' : isActive ? 'text-text-primary' : 'text-text-muted'
                            }`}>
                              {s.label}
                            </p>
                            {isActive && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5, ease: 'easeInOut' }}
                                className="mt-1.5 h-0.5 bg-gradient-to-r from-accent to-accent/20 rounded-full"
                              />
                            )}
                          </div>

                          {/* Right indicator */}
                          <div className="flex-shrink-0">
                            {isDone && (
                              <span className="text-xs text-accent/70 font-mono">✓</span>
                            )}
                            {isActive && (
                              <div className="flex gap-0.5">
                                {[0, 1, 2].map((dot) => (
                                  <motion.div
                                    key={dot}
                                    className="w-1 h-1 rounded-full bg-accent"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-accent/70 to-accent rounded-full"
                      />
                    </div>
                    <p className="text-xs text-text-muted text-right font-mono">
                      {Math.round(generationProgress)}%
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  )
}
