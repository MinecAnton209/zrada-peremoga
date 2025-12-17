"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Pusher from "pusher-js";
import { useTheme } from "next-themes";
import { useSearchParams, useRouter } from "next/navigation";
import { Moon, Sun, Share2, Activity } from "lucide-react";

type ResultType = "IDLE" | "ZRADA" | "PEREMOGA" | "TOTAL_ZRADA" | "TOTAL_PEREMOGA";

interface HistoryItem {
  query: string;
  result: ResultType;
  time: number;
}

interface PusherData extends HistoryItem {
  isTotal: boolean;
}

const LOADING_PHRASES = [
  "Звертаюсь до Всесвіту...",
  "Завантажуємо документи з Дії...",
  "Перевіряємо карму...",
  "Аналізуємо борщовий набір...",
  "Раджусь з котом Степаном...",
  "Дзвоню в Генштаб...",
  "Шукаємо зраду в атомах...",
  "Підкручуємо удачу...",
  "Скануємо біоритми...",
  "Питаю у Арестовича...",
  "Оновлюю статус...",
];

function GameContent() {
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<ResultType>("IDLE");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const [shareLabel, setShareLabel] = useState("Поширити");
  
  const [stats, setStats] = useState({ zrada: 0, peremoga: 0 });
  const [trends, setTrends] = useState<(string | number)[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setMounted(true);
    
    fetch("/api/check")
      .then(res => res.json())
      .then(data => {
        setStats({ zrada: Number(data.zrada) || 0, peremoga: Number(data.peremoga) || 0 });
        setTrends(data.trends || []);
        if (data.history) {
           const parsed = data.history.map((h: string | HistoryItem) => 
             typeof h === 'string' ? JSON.parse(h) : h
           );
           setHistory(parsed);
        }

        const q = searchParams.get("q");
        const r = searchParams.get("res");
        if (q && r) {
          setQuery(q);
          const codes: Record<string, ResultType> = { 
            "0": "PEREMOGA", "1": "ZRADA", "2": "TOTAL_PEREMOGA", "3": "TOTAL_ZRADA" 
          };
          if (codes[r]) setStatus(codes[r]);
        }
      })
      .catch(err => console.error("Init Error:", err));

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe("zrada-channel");
    channel.bind("new-check", (data: PusherData) => {
      if (data.result.includes("ZRADA")) setStats(prev => ({ ...prev, zrada: prev.zrada + 1 }));
      else setStats(prev => ({ ...prev, peremoga: prev.peremoga + 1 }));
      setHistory(prev => [data, ...prev].slice(0, 10));
    });

    return () => { pusher.unsubscribe("zrada-channel"); };
  }, [searchParams]);

  const triggerCheck = async () => {
    if (loading || !query.trim()) return;
    setLoading(true);
    setStatus("IDLE");
    setLoadingText(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setTimeout(async () => {
      try {
        const res = await fetch("/api/check", { method: "POST", body: JSON.stringify({ query }) });
        const data = await res.json();
        setLoading(false);
        setStatus(data.result);

        if (data.result === "TOTAL_PEREMOGA") triggerEpicConfetti();
        else if (data.result === "PEREMOGA") triggerConfetti();
        
        if (navigator.vibrate) {
          navigator.vibrate(data.result.includes("TOTAL") ? [100, 50, 200] : 100);
        }
      } catch (e) {
        setLoading(false);
      }
    }, 1500);
  };

  const shareResult = async () => {
    const codes: Record<string, string> = { 
      "PEREMOGA": "0", "ZRADA": "1", "TOTAL_PEREMOGA": "2", "TOTAL_ZRADA": "3" 
    };
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const url = `${baseUrl}?q=${encodeURIComponent(query)}&res=${codes[status] || "0"}`;
    const text = `Мій вердикт для "${query}" — ${status.replace("TOTAL_", "")}! 🇺🇦`;

    if (navigator.share) {
      try { await navigator.share({ title: "Реєстр Долі", text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareLabel("Скопійовано!");
      setTimeout(() => setShareLabel("Поширити"), 2000);
    }
  };

  const triggerConfetti = () => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  
  const triggerEpicConfetti = () => {
    const end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 10, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#FFF'] });
      confetti({ particleCount: 10, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#0057B8', '#FFF'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const getBgStyle = () => {
    if (status === "TOTAL_ZRADA") return "bg-red-950 animate-pulse text-white";
    if (status === "TOTAL_PEREMOGA") return "bg-yellow-600 animate-pulse text-black"; 
    if (status.includes("ZRADA")) return "bg-red-50 dark:bg-red-950/30";
    if (status.includes("PEREMOGA")) return "bg-yellow-50 dark:bg-yellow-950/30";
    return "bg-slate-50 dark:bg-slate-950";
  };

  if (!mounted) return null;

  return (
    <main className={`min-h-[100dvh] w-full flex flex-col items-center justify-between transition-all duration-500 relative overflow-hidden ${getBgStyle()}`}>
      
      {/* HEADER: Compact on mobile */}
      <div className="w-full max-w-4xl px-4 pt-6 flex justify-between items-start z-50">
        <div className="flex flex-col text-[10px] sm:text-xs font-mono opacity-80 gap-1 font-bold uppercase tracking-tight">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Activity size={12} /> <span className="hidden sm:inline">ЗРАД:</span> {stats.zrada.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
            <Activity size={12} /> <span className="hidden sm:inline">ПЕРЕМОГ:</span> {stats.peremoga.toLocaleString()}
          </div>
        </div>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 sm:p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-lg transition-transform active:scale-90">
          {theme === "dark" ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-indigo-600"/>}
        </button>
      </div>

      {/* CONTENT: Adaptive padding & sizes */}
      <div className="w-full max-w-2xl px-4 flex-1 flex flex-col justify-center items-center text-center relative z-10 py-10">
        <AnimatePresence mode="wait">
          
          {(status === "IDLE" || loading) && (
            <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex flex-col items-center">
              <h1 className="font-oswald text-5xl sm:text-7xl md:text-8xl font-black mb-8 dark:text-white leading-none tracking-tighter">
                РЕЄСТР <br/><span className="text-indigo-600 dark:text-indigo-500">ДОЛІ</span>
              </h1>
              
              {!loading ? (
                <div className="w-full max-w-sm space-y-4">
                  <input
                    value={query} onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && triggerCheck()}
                    placeholder="Введіть запит..."
                    className="w-full px-6 py-4 sm:py-5 text-center text-lg sm:text-xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    maxLength={30}
                  />
                  <button onClick={triggerCheck} className="w-full py-4 sm:py-5 rounded-3xl bg-indigo-600 text-white font-oswald text-xl sm:text-2xl uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-500/20">
                    ВИЗНАЧИТИ
                  </button>
                  
                  {/* Trends: Responsive grid */}
                  {trends.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-6 sm:mt-8 opacity-70">
                      {trends.slice(0, 6).map((t, i) => (
                        <button key={i} onClick={() => setQuery(String(t))} className="px-3 py-1 text-[10px] sm:text-xs rounded-full bg-slate-200 dark:bg-slate-800 uppercase font-bold hover:bg-indigo-500 hover:text-white transition-colors">
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"/>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-oswald text-xs tracking-[0.2em] opacity-50 uppercase px-4 break-words">
                    {loadingText}
                  </motion.p>
                </div>
              )}
            </motion.div>
          )}

          {!loading && status !== "IDLE" && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center">
              <div className="mb-4 sm:mb-6 px-4 py-1 rounded-full bg-slate-500/10 text-[10px] font-black tracking-widest uppercase backdrop-blur-sm">
                Запит: {query}
              </div>
              
              {/* Responsive Text Sizes */}
              <h2 className={`font-oswald font-black uppercase leading-[0.85] mb-4 select-none break-all
                ${status.includes("TOTAL") ? "text-6xl sm:text-8xl md:text-9xl animate-bounce" : "text-7xl sm:text-9xl md:text-[10rem]"}
                ${status.includes("ZRADA") ? "text-red-600" : "text-yellow-500"}`}>
                {status.replace("TOTAL_", "")}
              </h2>

              {status.includes("TOTAL") && (
                <div className="bg-black text-white px-4 sm:px-6 py-1 font-oswald text-base sm:text-xl tracking-[0.3em] mb-8 animate-pulse rounded-lg">
                  ТОТАЛЬНА
                </div>
              )}
              
              {/* Buttons: Stacked on mobile, side-by-side on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm mt-8 sm:mt-12">
                <button onClick={() => { setStatus("IDLE"); setQuery(""); router.push("/"); }} className="py-3 sm:py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 font-oswald uppercase tracking-widest text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
                  Ще раз
                </button>
                <button onClick={shareResult} className="py-3 sm:py-4 rounded-2xl bg-indigo-600 text-white font-oswald uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all active:scale-95">
                  <Share2 size={16}/> {shareLabel}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER TICKER */}
      <div className="w-full h-10 sm:h-12 flex items-center overflow-hidden relative bg-transparent border-t border-slate-200/10 pointer-events-none">
        <div className="flex gap-8 sm:gap-12 animate-[marquee_25s_linear_infinite] whitespace-nowrap px-4 sm:px-12">
          {history.length > 0 ? history.map((item, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 text-[10px] font-bold font-mono uppercase opacity-40">
              <span>{new Date(item.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              <span className="text-slate-400 dark:text-slate-500">/</span>
              <span>{item.query}</span>
              <span className={item.result.includes("ZRADA") ? "text-red-500" : "text-yellow-500"}>{item.result.replace("TOTAL_","")}</span>
            </div>
          )) : (
            <span className="text-[10px] font-mono uppercase opacity-30">
              З&apos;єднання з ноосферою...
            </span>
          )}
        </div>
      </div>
    </main>
  );
}

export default function MainGame() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-oswald tracking-widest animate-pulse opacity-50 uppercase text-xs">Завантаження...</div>}>
      <GameContent />
    </Suspense>
  );
}
