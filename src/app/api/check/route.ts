import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import Pusher from "pusher";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});

const PREDEFINED: Record<string, number> = {
    "паляниця": 2, "бавовна": 2, "україна": 2, "зсу": 2, "азов": 2,
    "крим": 2, "буданов": 2, "залужний": 2, "маріуполь": 2, "діти": 2,

    "борщ": 0, "кавун": 0, "волонтери": 0, "дія": 0, "монобанк": 0,
    "сало": 0, "київ": 0, "львів": 0, "харків": 0, "одеса": 0, "сирники": 0,
    "джавелін": 0, "хаймерс": 0, "атб": 0, "кіт": 0, "пес патрон": 0,
    "minecanton209": 0,

    "тривога": 1, "черга": 1, "корупція": 1, "графік": 1, "ціни": 1,
    "курс": 1, "понеділок": 1, "сесія": 1, "мтс": 1, "затори": 1,
    "сусіди": 1, "тариф": 1, "холод": 1, "дощ": 1,

    "русня": 3, "путін": 3, "москва": 3, "шахед": 3, "тцк": 3,
    "кацап": 3, "блекаут": 3, "ракета": 3, "обстріл": 3, "кремль": 3
};

const getStatusFromCode = (code: number) => {
    switch (code) {
        case 0: return { result: "PEREMOGA", isTotal: false };
        case 1: return { result: "ZRADA", isTotal: false };
        case 2: return { result: "TOTAL_PEREMOGA", isTotal: true };
        case 3: return { result: "TOTAL_ZRADA", isTotal: true };
        default: return { result: "IDLE", isTotal: false };
    }
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const query = body.query || "";
        const cleanQuery = query.trim().toLowerCase().slice(0, 30);

        if (!cleanQuery) return NextResponse.json({ result: "IDLE" });

        let statusData;

        const foundEntry = Object.entries(PREDEFINED).find(([key]) => cleanQuery.includes(key));

        if (foundEntry) {
            statusData = getStatusFromCode(foundEntry[1]);
        } else {
            let sum = 0;
            for (let i = 0; i < cleanQuery.length; i++) sum += cleanQuery.charCodeAt(i);

            const isZrada = (sum % 10 >= 6);

            const isTotal = Math.random() < 0.01;

            if (isTotal) {
                statusData = isZrada ? getStatusFromCode(3) : getStatusFromCode(2);
            } else {
                statusData = isZrada ? getStatusFromCode(1) : getStatusFromCode(0);
            }
        }

        const { result, isTotal } = statusData;

        const pipeline = redis.pipeline();

        if (result.includes("ZRADA")) pipeline.incr("stats:zrada");
        else pipeline.incr("stats:peremoga");

        if (cleanQuery.length > 2) {
            pipeline.zincrby("trends", 1, cleanQuery);
        }

        const historyItem = { query: cleanQuery, result, time: Date.now() };
        pipeline.lpush("history", JSON.stringify(historyItem));
        pipeline.ltrim("history", 0, 9);
        await pipeline.exec();

        try {
            await pusher.trigger("zrada-channel", "new-check", { ...historyItem, isTotal });
        } catch (e) {
            console.error("Pusher trigger failed:", e);
        }

        return NextResponse.json({ result, isTotal });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const [zrada, peremoga, rawTrends, history] = await Promise.all([
            redis.get("stats:zrada"),
            redis.get("stats:peremoga"),
            redis.zrange("trends", 0, 5, { rev: true, withScores: true }),
            redis.lrange("history", 0, 9)
        ]);

        return NextResponse.json({
            zrada: Number(zrada) || 0,
            peremoga: Number(peremoga) || 0,
            trends: rawTrends || [],
            history: history || []
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ zrada: 0, peremoga: 0, trends: [], history: [] });
    }
}