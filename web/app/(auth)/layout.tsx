import Link from "next/link";
import { ArrowUpRight, Check, Circle, Command, Layers3, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden border-r border-border bg-[#181d15] p-10 lg:flex lg:flex-col xl:p-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#c8f36a_1px,transparent_1px),linear-gradient(90deg,#c8f36a_1px,transparent_1px)] [background-size:56px_56px]" />
        <Link href="/" className="relative flex w-fit items-center gap-3 text-xl font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[#18200f]"><Layers3 size={20} /></span>
          ProjectAI<span className="ml-1 rounded border border-primary/20 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-primary">WORKSPACE</span>
        </Link>

        <div className="relative my-auto max-w-xl py-16">
          <div className="mb-7 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> A little clarity. A lot of progress.</div>
          <h1 className="max-w-lg text-5xl font-medium leading-[1.12] tracking-[-0.045em] xl:text-6xl">Your best work.<br /><span className="text-primary">All in one place.</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#a7b09e]">Turn big ideas into clear next steps. Bring your projects, people, and an AI helping hand together.</p>

          <div aria-label="Illustrative project workspace preview" className="mt-12 rounded-2xl border border-[#39432f] bg-[#1f261a] p-5 shadow-[0_24px_64px_-30px_rgba(0,0,0,0.65)] xl:mr-6 xl:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-[#c8f36a]/10 p-2 text-primary"><Command size={18} /></span><div><p className="text-sm font-medium">The next big thing</p><p className="mt-1 text-[11px] text-[#97a48b]">A little more organized, already.</p></div></div>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] text-primary">In progress</span>
            </div>
            <div className="space-y-4 py-5">
              <div className="flex items-center gap-3 text-sm text-[#97a48b]"><span className="rounded-full bg-primary p-0.5 text-[#18200f]"><Check size={12} /></span><span className="line-through decoration-[#66725d]">Bring the team together</span></div>
              <div className="flex items-center gap-3 text-sm text-[#97a48b]"><span className="rounded-full bg-primary p-0.5 text-[#18200f]"><Check size={12} /></span><span className="line-through decoration-[#66725d]">Make a plan worth building</span></div>
              <div className="flex items-center gap-3 text-sm"><Circle size={16} className="text-primary" /><span>Turn the next idea into action</span><ArrowUpRight size={15} className="ml-auto text-[#97a48b]" /></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/[0.06] p-3"><Sparkles size={16} className="mt-0.5 shrink-0 text-primary" /><p className="text-xs leading-5 text-[#bfcdaf]">A clearer path from idea to done.<br /><span className="text-[#849477]">AI can help you find your next step.</span></p></div>
          </div>
        </div>
        <div className="relative flex items-center justify-between text-xs text-[#819074]"><span>Built for teams that build things.</span><span>Less noise. More momentum.</span></div>
      </section>

      <section className="relative flex min-h-screen flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden"><span className="rounded-lg bg-primary p-2 text-[#18200f]"><Layers3 size={18} /></span>ProjectAI</Link>
          <Link href="/" className="ml-auto flex items-center gap-1.5 text-xs text-[#929b88] transition hover:text-foreground">Back to home <ArrowUpRight size={14} /></Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-[400px] py-14">{children}</div>
        <p className="text-center text-[11px] text-[#727b69]">Your next chapter of better work starts here.</p>
      </section>
    </main>
  );
}
