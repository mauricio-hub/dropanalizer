'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import { Sparkles, Check, Rocket, Flame, Upload, X, AlertCircle } from 'lucide-react'
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

  // Step 1: Template
  const [template, setTemplate] = useState<'producto_nuevo' | 'oferta_limitada' | null>(null)

  // Step 2: Product info
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  // Step 3: Generation
  const [generationProgress, setGenerationProgress] = useState(0)

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''

  // Simulate generation progress animation
  useEffect(() => {
    if (step === 3 && loading) {
      const interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 95) return 95
          return prev + Math.random() * 25
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step, loading])

  // Trigger generation when step becomes 3
  useEffect(() => {
    if (step === 3 && !loading) {
      handleCreateProposal()
    }
  }, [step])

  const generationSteps = [
    'Analizando tu producto...',
    'Creando beneficios...',
    'Optimizando para conversión...',
    'Casi listo...',
  ]

  const currentGenerationText = generationSteps[Math.floor((generationProgress / 100) * generationSteps.length) % generationSteps.length]

  async function uploadImageToCloudinary(file: File): Promise<CloudinaryResponse | null> {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Imagen muy grande. Máximo 5MB.')
      return null
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Formato no soportado. Usa JPG, PNG o WebP.')
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
      setImageError('Error al subir imagen. Intenta de nuevo.')
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
      setImageError('Máximo 5 imágenes.')
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

  function canProceedStep2(): boolean {
    return (
      productName.trim().length > 0 &&
      price.trim().length > 0 &&
      !isNaN(parseFloat(price)) &&
      parseFloat(price) >= 0 &&
      images.length > 0 &&
      !uploadingImage
    )
  }

  async function handleCreateProposal() {
    if (!template || images.length === 0) return

    setLoading(true)
    setError('')
    setGenerationProgress(0)

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
          description: description.trim() || undefined,
          images: imageData,
          generateWithAI: true,
        }),
      })

      setGenerationProgress(100)

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al crear landing')
        setLoading(false)
        return
      }

      const proposal = await res.json()

      // Wait a bit for the visual effect
      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push(`/proposals/${proposal.id}/edit`)
    } catch (err) {
      setError('Error al crear landing. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container className="max-w-2xl">
        <PageHeader
          title="Crear Nueva Landing"
          subtitle="Genera una página de producto profesional en minutos"
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
                  ¿Qué tipo de producto es?
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
                        <h3 className="font-semibold text-text-primary">Producto Nuevo</h3>
                        <p className="text-sm text-text-muted mt-1">
                          Valida un nuevo producto rápidamente
                        </p>
                      </div>
                      {template === 'producto_nuevo' && (
                        <div className="flex items-center gap-2 pt-2">
                          <Check className="h-4 w-4 text-accent" />
                          <span className="text-sm text-accent">Seleccionado</span>
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
                        <h3 className="font-semibold text-text-primary">Oferta Limitada</h3>
                        <p className="text-sm text-text-muted mt-1">
                          Crea urgencia con descuentos y escasez
                        </p>
                      </div>
                      {template === 'oferta_limitada' && (
                        <div className="flex items-center gap-2 pt-2">
                          <Check className="h-4 w-4 text-accent" />
                          <span className="text-sm text-accent">Seleccionado</span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!template}
                  >
                    Continuar
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
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ej: Reloj inteligente con GPS"
                  className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>

              {/* Price & Currency */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-secondary">Precio</label>
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
                  <label className="text-sm font-semibold text-text-secondary">Moneda</label>
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
                    Precio Original (opcional)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Precio sin descuento"
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-text-secondary">
                  Imágenes del Producto (3-5 imágenes)
                </label>

                {/* Upload Zone */}
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
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
                      Arrastra imágenes o haz clic
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      JPG, PNG o WebP • Máx 5MB cada una
                    </p>
                    {uploadingImage && (
                      <p className="text-xs text-accent mt-2 animate-pulse">
                        Subiendo...
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
                            Principal
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
                  {images.length}/5 imágenes subidas
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold text-text-secondary hover:text-accent transition-colors">
                    ✓ Agregar contexto adicional (opcional)
                  </summary>
                  <div className="pt-3">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalles del producto, características, etc."
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
                  Atrás
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2()}
                  className={!canProceedStep2() ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Generar Landing
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
                      Intentar de nuevo
                    </Button>
                  )}
                </div>
              )}

              {!error && (
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <div className="inline-block">
                      <Sparkles className="h-12 w-12 text-accent animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {currentGenerationText}
                    </h3>
                    <p className="text-sm text-text-muted">
                      Esto toma unos segundos...
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${generationProgress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-accent"
                    />
                  </div>

                  <p className="text-xs text-text-muted">
                    {Math.round(generationProgress)}%
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  )
}
