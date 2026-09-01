'use client'

import { Bot, Sparkles } from 'lucide-react'

export default function AIPage() {
  return (
    <main className="min-h-screen bg-[#070812] text-white grid place-items-center p-6">
      <section className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[.03] p-8 md:p-12">
        <div className="flex items-center gap-3 text-[#E8FF00]">
          <Bot size={20} />
          <span className="text-[10px] uppercase tracking-[.28em]">WOB ART / AI</span>
        </div>
        <h1 className="mt-5 font-display text-5xl md:text-7xl">AI WORKSPACE</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
          Spațiul AI este pregătit pentru integrarea agenților WOB ART. Interfața Nexus existentă nu este prezentă în acest branch, astfel încât ruta rămâne funcțională fără un import lipsă.
        </p>
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#E8FF00]/20 bg-[#E8FF00]/5 p-4 text-sm text-white/70">
          <Sparkles size={16} className="text-[#E8FF00]" />
          Agent workspace ready.
        </div>
      </section>
    </main>
  )
}
