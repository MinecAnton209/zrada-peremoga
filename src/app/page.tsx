import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { calculateFate } from '@/lib/fate'
import GameClient from './GameClient'

export async function generateMetadata({
                                           searchParams,
                                       }: {
    searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
    const params = await searchParams
    const q = params.q

    if (!q) {
        return {
            title: 'Зрада чи Перемога? — Єдиний реєстр долі',
            description: 'Дізнайся вердикт для свого запиту.',
        }
    }

    const { code } = calculateFate(q)
    const ogUrl = `/api/og?query=${encodeURIComponent(q)}&result=${code}`

    return {
        title: `Вердикт для: ${q}`,
        openGraph: {
            images: [{ url: ogUrl }],
        },
    }
}

export default async function Page({
                                       searchParams,
                                   }: {
    searchParams: Promise<{ q?: string }>
}) {
    const params = await searchParams

    const recentRaw = await prisma.history.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        },
    })

    const recent = recentRaw.map(item => ({
        id: item.id.toString(),
        query: item.query,
        resultCode: item.resultCode,
    }))

    let initialResult = null
    if (params.q) {
        const queryStr = params.q.trim()
        const { code } = calculateFate(queryStr)

        const stats = await prisma.history.count({
            where: { query: { equals: queryStr, mode: 'insensitive' } }
        })

        initialResult = {
            query: queryStr,
            resultCode: code,
            statsCount: stats || 1
        }
    }

    return (
        <GameClient
            key={params.q || 'home'}
            initialRecent={recent}
            initialResult={initialResult}
        />
    )
}