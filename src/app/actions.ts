'use server'
import { prisma } from '@/lib/prisma'
import { calculateFate } from '@/lib/fate'

export async function checkFateAction(prevState: any, formData: FormData) {
    const query = formData.get('query') as string
    if (!query) return null

    const { code, isTotal } = calculateFate(query)

    await prisma.history.create({
        data: {
            query: query.trim().slice(0, 30),
            resultCode: code
        },
    })

    const statsCount = await prisma.history.count({
        where: { query: { equals: query.trim(), mode: 'insensitive' } }
    })

    return { query, resultCode: code, statsCount, isTotal }
}