import { ArrowDown, ArrowRight, ArrowUpRight, BookOpenText } from "lucide-react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { campusTopics } from "@/lib/campusTopics";

const footerLinks = [
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/privacy-policy", "Privacy"],
  ["/terms-of-service", "Terms"],
  ["/license", "License"],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f0e4] text-[#242219] selection:bg-[#f3cc55]">
      <SiteNav />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:py-24">
          <div>
            <p className="mb-5 text-sm font-semibold text-[#685018]">Shiv Nadar University · Delhi NCR</p>
            <h1 className="max-w-3xl font-serif text-[clamp(3.15rem,8vw,7.2rem)] leading-[0.93] tracking-[-0.065em]">
              Find your way<br />around SNU<span className="text-[#9c640a]">.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#625c4d] sm:text-lg">
              Ask about courses, campus services, or university policies. SNUGPT searches SNU material and names the documents behind its answers.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/chat" className="inline-flex items-center gap-3 rounded-lg bg-[#f3cc55] px-5 py-3 font-bold text-[#211b0d] hover:bg-[#eec03d]">
                Ask a question <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="#features" className="inline-flex items-center gap-2 rounded-sm py-2 text-sm font-semibold hover:underline">
                Browse campus topics <ArrowDown aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>

          <figure className="relative rounded-xl border border-[#cabc96] bg-[#ede4cf] p-2 shadow-[5px_6px_0_#e3d6b6] sm:p-3">
            <div className="rounded-lg border border-[#d7c9a5] bg-[#fffcf2] p-5 sm:p-7">
              <figcaption className="mb-5 flex items-center gap-2 border-b border-[#e3d9bf] pb-4 text-xs font-bold uppercase tracking-[0.13em] text-[#6d5724]">
                <BookOpenText aria-hidden="true" className="size-4" /> Example answer
              </figcaption>
              <blockquote className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
                What’s the prerequisite for ECE3315?
              </blockquote>
              <p className="mt-5 text-sm leading-6 text-[#4c4739]">
                For the 2025–2029 cohort, the prerequisite for Antenna Theory and Wave Propagation is <strong className="text-[#292418]">ECE2005</strong>.
              </p>
              <div className="mt-5 border-l-2 border-[#c38b23] pl-3 text-xs font-semibold leading-5 text-[#6d5724]">
                ECE Prospectus · 2025–2029 cohort · PDF p. 7
              </div>
            </div>
          </figure>
        </section>

        <section id="features" aria-labelledby="topics-title" className="scroll-mt-20 border-y border-[#dcd1b9] bg-[#eee7d6]">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
            <h2 id="topics-title" className="font-serif text-4xl tracking-tight sm:text-5xl">Explore campus topics</h2>
            <ul className="mt-7 grid border-t border-[#cfc3a7] md:grid-cols-2 md:gap-x-12">
              {campusTopics.map(topic => (
                <li key={topic.name} className="border-b border-[#cfc3a7]">
                  <Link href={{ pathname: "/chat", query: { q: topic.question } }} className="group flex items-center justify-between gap-5 px-1 py-5 hover:bg-[#e6dcc4]">
                    <div>
                      <h3 className="text-lg font-bold">{topic.name}</h3>
                      <p className="mt-1 text-sm text-[#635d4e]">{topic.detail}</p>
                    </div>
                    <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-[#75541e] motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[#625c4d] sm:px-8 md:flex-row md:items-center md:justify-between">
        <p>Student-built and unofficial. Check university sources before acting on an answer.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map(([href, title]) => <Link key={href} href={href} className="hover:underline">{title}</Link>)}
        </nav>
      </footer>
    </div>
  );
}
