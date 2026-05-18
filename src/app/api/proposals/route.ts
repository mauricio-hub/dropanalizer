import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateProposalContent, generateDropshippingContent } from '@/lib/openai'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const proposals = await prisma.proposal.findMany({
    where: { userId: user.id },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(proposals)
}

const FREE_PLAN_LIMIT = 3

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Enforce Free plan limit
    const count = await prisma.proposal.count({ where: { userId: user.id } })
    if (count >= FREE_PLAN_LIMIT) {
      return NextResponse.json(
        {
          error: 'free_limit_reached',
          message: `El plan gratuito permite hasta ${FREE_PLAN_LIMIT} landings. Elimina una existente o actualiza tu plan.`,
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { productName, price, currency, template, landingStyle = 'luxury', audienceLang = 'es', description, generateWithAI = true, images = [], selectedCatalogItemIds = [], buyUrl } = body

    // Support both new dropshipping flow and legacy brief flow
    const isDropshippingFlow = productName && price !== undefined && currency && template
    const isLegacyFlow = body.title && body.brief

    if (!isDropshippingFlow && !isLegacyFlow) {
      return NextResponse.json(
        { error: 'Either (productName, price, currency, template) or (title, brief) are required' },
        { status: 400 }
      )
    }

    // Validate dropshipping flow
    if (isDropshippingFlow) {
      if (productName.length < 3 || productName.length > 200) {
        return NextResponse.json(
          { error: 'productName must be between 3 and 200 characters' },
          { status: 400 }
        )
      }

      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json(
          { error: 'price must be a non-negative number' },
          { status: 400 }
        )
      }

      if (!['USD', 'EUR', 'MXN', 'ARS', 'COP'].includes(currency)) {
        return NextResponse.json(
          { error: 'currency must be one of: USD, EUR, MXN, ARS, COP' },
          { status: 400 }
        )
      }

      if (!['producto_nuevo', 'oferta_limitada'].includes(template)) {
        return NextResponse.json(
          { error: 'template must be either "producto_nuevo" or "oferta_limitada"' },
          { status: 400 }
        )
      }

      if (images.length === 0) {
        return NextResponse.json(
          { error: 'At least 1 image is required' },
          { status: 400 }
        )
      }
    }

    // Validate legacy flow
    if (isLegacyFlow) {
      const { title, brief } = body
      if (!title || !brief) {
        return NextResponse.json(
          { error: 'title and brief are required' },
          { status: 400 }
        )
      }

      if (title.length < 5 || title.length > 200) {
        return NextResponse.json(
          { error: 'title must be between 5 and 200 characters' },
          { status: 400 }
        )
      }

      if (brief.length < 20 || brief.length > 5000) {
        return NextResponse.json(
          { error: 'brief must be between 20 and 5000 characters' },
          { status: 400 }
        )
      }
    }

    const proposalData = {
      title: isDropshippingFlow ? productName : body.title,
      description: isDropshippingFlow ? description : body.brief,
      type: 'product',
      template: isDropshippingFlow ? `${template}_${landingStyle}` : 'producto_nuevo',
      status: 'draft' as const,
      tenantId: user.id,
      userId: user.id,
      buyUrl: buyUrl || null,
    }

    const proposal = await prisma.proposal.create({
      data: proposalData,
    })

    let versionContent: any = null
    let generatedAt = null

    // Dropshipping flow
    if (isDropshippingFlow) {
      try {
        versionContent = await generateDropshippingContent(
          productName,
          price,
          currency,
          template,
          description,
          undefined,
          audienceLang
        )
        generatedAt = new Date()
      } catch (aiError) {
        console.error('AI generation failed for dropshipping:', aiError)
        return NextResponse.json(
          {
            error: 'Failed to generate landing content with AI',
            details: aiError instanceof Error ? aiError.message : 'Unknown error',
          },
          { status: 500 }
        )
      }
    } else {
      // Legacy proposal flow
      const brief = body.brief
      versionContent = {
        contentType: 'proposal',
        scope: '',
        deliverables: [],
        timeline: [],
        pricing: { total: 0, currency: 'USD' },
      }

      if (selectedCatalogItemIds.length > 0) {
        const catalogItems = await prisma.product.findMany({
          where: {
            id: { in: selectedCatalogItemIds },
            userId: user.id,
          },
        })

        const totalPrice = catalogItems.reduce((sum, item) => sum + (item.price || 0), 0)
        const catalogPrices = catalogItems.map(item => ({ name: item.name, price: item.price || 0 }))

        try {
          const aiContent = await generateProposalContent(brief, user.id, catalogPrices)

          versionContent = {
            contentType: 'proposal',
            ...aiContent,
            pricing: {
              total: totalPrice,
              currency: 'USD',
              breakdown: catalogItems.map(item => `${item.name}: $${item.price || 0}`).join(', '),
            },
          }
          generatedAt = new Date()
        } catch (aiError) {
          console.error('AI enrichment failed, using basic structure:', aiError)
          versionContent = {
            contentType: 'proposal',
            scope: brief,
            deliverables: catalogItems.map(item => item.name),
            timeline: [
              {
                phase: 'Implementación',
                duration: '2-4 semanas',
                description: 'Desarrollo e implementación de los servicios/productos seleccionados',
              },
            ],
            pricing: {
              total: totalPrice,
              currency: 'USD',
              breakdown: catalogItems.map(item => `${item.name}: $${item.price || 0}`).join(', '),
            },
          }
        }
      } else if (generateWithAI) {
        try {
          const aiContent = await generateProposalContent(brief, user.id)
          versionContent = {
            contentType: 'proposal',
            ...aiContent,
          }
          generatedAt = new Date()
        } catch (aiError) {
          console.error('AI generation failed, creating empty version:', aiError)
          return NextResponse.json(
            {
              error: 'Failed to generate proposal content with AI',
              details: aiError instanceof Error ? aiError.message : 'Unknown error',
            },
            { status: 500 }
          )
        }
      }
    }

    const version = await prisma.version.create({
      data: {
        proposalId: proposal.id,
        version: 1,
        content: versionContent,
        generatedAt,
        isPublished: false,
      },
    })

    // Create image records if provided (dropshipping flow)
    if (isDropshippingFlow && images.length > 0) {
      await prisma.image.createMany({
        data: images.map((img: any, idx: number) => ({
          proposalId: proposal.id,
          url: img.url,
          publicId: img.publicId,
          order: idx,
        })),
      })
    }

    return NextResponse.json(
      {
        ...proposal,
        versions: [version],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
}
