import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Catalog GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch catalog' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, price, type } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'name and type are required' },
        { status: 400 }
      )
    }

    if (!['service', 'product'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be "service" or "product"' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: price ? parseFloat(price) : null,
        type,
        userId: user.id,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Catalog POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create catalog item' },
      { status: 500 }
    )
  }
}
