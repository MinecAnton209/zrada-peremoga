'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkFateAction } from './actions'
import { FATE_CONFIG } from '@/lib/config'
import { Sparkles, RotateCcw, Loader2, Share2, Check, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface RecentItem {
    id: string
    query: string
    resultCode: number
}

interface GameResult {
    query: string
    resultCode: number
    statsCount: number
}

interface GameClientProps {
    initialRecent: RecentItem[]
    initialResult: GameResult | null
}

export default function GameClient({ initialRecent, initialResult }: GameClientProps) {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(checkFateAction, initialResult)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (state && FATE_CONFIG.variants[state.resultCode]?.confetti) {
            const duration = 3 * 1000
            const animationEnd = Date.now() + duration
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

            const interval: ReturnType<typeof setInterval> = setInterval(() => {
                const timeLeft = animationEnd - Date.now()
                if (timeLeft <= 0) {
                    clearInterval(interval)
                    return
                }

                const particleCount = 50 * (timeLeft / duration)
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
            }, 250)

            return () => clearInterval(interval)
        }
    }, [state])

    const getTelegramHref = () => {
        if (!state) return '#'
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const shareUrl = `${origin}/?q=${encodeURIComponent(state.query)}`
        const text = `Мій вердикт: ${FATE_CONFIG.variants[state.resultCode].title}`
        return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
    }

    return (
        <div className="fixed inset-0 bg-[#050505] font-sans overflow-hidden selection:bg-indigo-500/30 text-white">
            <AnimatePresence mode="wait">
                {!state ? (
                    <motion.main
                        key="home"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
                        className="h-full w-full flex flex-col items-center justify-center p-4 sm:p-6 relative z-10"
                    >
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[100vw] h-[100vw] bg-indigo-600/10 rounded-full blur-[120px]" />
                        </div>

                        <div className="w-full max-w-md flex flex-col h-full max-h-[800px] justify-between py-6 z-10">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-center space-y-4 shrink-0"
                            >
                                <h1 className="flex flex-col items-center leading-none tracking-[ -0.05em]">
                                    <span className="text-5xl sm:text-7xl font-[1000] text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_0_25px_rgba(220,38,38,0.7)]">
                                        ЗРАДА
                                    </span>
                                    <span className="text-5xl sm:text-7xl font-[1000] text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-700 drop-shadow-[0_0_25px_rgba(37,99,235,0.7)]">
                                        ПЕРЕМОГА
                                    </span>
                                </h1>
                                <p className="text-slate-500 text-[10px] font-black tracking-[0.4em] uppercase opacity-60">Global Fate Registry</p>
                            </motion.div>

                            <motion.div layoutId="card" className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-1 shadow-2xl ring-1 ring-white/5 my-4 shrink-0">
                                <div className="bg-[#0A0A0A]/80 rounded-[2.2rem] p-6 border border-white/5">
                                    <form action={formAction} className="space-y-4">
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 transition-colors group-focus-within:text-indigo-500" />
                                            <input
                                                name="query"
                                                required
                                                autoComplete="off"
                                                disabled={isPending}
                                                placeholder="Введіть запит..."
                                                className="w-full bg-black/50 border border-white/10 text-white text-base p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isPending}
                                            className="w-full bg-white text-black font-black py-4 rounded-2xl text-base hover:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-white/5"
                                        >
                                            {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                            {isPending ? "АНАЛІЗ..." : "АНАЛІЗУВАТИ"}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>

                            <div className="flex-1 min-h-0 flex flex-col space-y-4 overflow-hidden">
                                <div className="flex items-center justify-center gap-3 opacity-20 shrink-0">
                                    <div className="h-[1px] flex-1 bg-white"></div>
                                    <p className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Activity</p>
                                    <div className="h-[1px] flex-1 bg-white"></div>
                                </div>

                                <div className="overflow-y-auto pr-1 flex-1 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] custom-scrollbar">
                                    <div className="space-y-2 pb-8">
                                        {initialRecent.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => router.push(`/?q=${encodeURIComponent(item.query)}`)}
                                                className="flex items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-white/5 cursor-pointer active:scale-[0.98] transition-all hover:bg-white/[0.05]"
                                            >
                                                <span className="text-slate-400 text-xs font-bold truncate pr-4">{item.query}</span>
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border ${
                                                    item.resultCode === 0 || item.resultCode === 2
                                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}>
                                                    {FATE_CONFIG.variants[item.resultCode].title.split(' ').pop()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.main>
                ) : (
                    <motion.main
                        key="result"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
                    >
                        <div className={`absolute inset-0 transition-colors duration-1000 ${FATE_CONFIG.variants[state.resultCode].color}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/70" />

                        <div className="w-full max-w-md space-y-8 relative z-10 flex flex-col items-center">
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="text-[9rem] sm:text-[11rem] drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] leading-none filter contrast-125"
                            >
                                {FATE_CONFIG.variants[state.resultCode].icon}
                            </motion.div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-60 ${state.resultCode === 2 ? 'text-black' : 'text-white'}`}>
                                        Об&apos;єкт вердикту: &quot;{state.query}&quot;
                                    </p>
                                    <h1 className={`text-6xl sm:text-8xl font-[1000] uppercase tracking-[ -0.05em] leading-tight drop-shadow-2xl ${state.resultCode === 2 ? 'text-black' : 'text-white'}`}>
                                        {FATE_CONFIG.variants[state.resultCode].title}
                                    </h1>
                                </div>

                                <div className="inline-block px-5 py-2 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 shadow-xl">
                                    <span className={`text-[10px] font-black tracking-widest ${state.resultCode === 2 ? 'text-black' : 'text-white'}`}>
                                        РЕЄСТРОВИЙ № {state.statsCount}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full space-y-4 pt-6">
                                <button
                                    onClick={() => {
                                        const shareUrl = `${window.location.origin}/?q=${encodeURIComponent(state.query)}`
                                        navigator.clipboard.writeText(shareUrl).then(() => {
                                            setCopied(true)
                                            setTimeout(() => setCopied(false), 2000)
                                        })
                                    }}
                                    className="w-full bg-white text-black font-black py-5 rounded-[2rem] text-lg flex items-center justify-center gap-3 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.15)]"
                                >
                                    {copied ? <Check /> : <Share2 />}
                                    {copied ? "СКОПІЙОВАНО" : "ПОДІЛИТИСЯ"}
                                </button>

                                <button
                                    onClick={() => {
                                        window.location.href = '/'
                                    }}
                                    className={`flex items-center justify-center gap-2 mx-auto py-2 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all ${
                                        state.resultCode === 2 ? 'text-black' : 'text-white'
                                    }`}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Спробувати ще раз
                                </button>
                            </div>
                        </div>
                    </motion.main>
                )}
            </AnimatePresence>
        </div>
    )
}