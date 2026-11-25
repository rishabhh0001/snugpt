import type { Metadata } from "next";
import Link from "next/link";
import { SiteArticle } from "@/components/SiteArticle";

export const metadata: Metadata = { title: "About SNUGPT" };

export default function AboutPage() {
  return <SiteArticle title="About SNUGPT">
    <p>SNUGPT is an unofficial student project for Shiv Nadar University, Delhi NCR, maintained by Rishabh Joshi. It helps students and applicants find answers across handbooks, program prospectuses, university policies, admissions pages, IT guides, and Career Development Center newsletters.</p>
    <section><h2>How answers are grounded</h2><p>The app searches document excerpts in Neon PostgreSQL with pgvector using NVIDIA embeddings, then passes the relevant excerpts to a NVIDIA chat model. Answers can cite a document by name and PDF page. Ask with your program and cohort when the rule changes by year.</p></section>
    <section><h2>What you can do</h2><p>Start with a campus topic, ask a follow-up, or report an incorrect answer. Chat tools can export saved conversations, print a chat to PDF, and download a calendar event for a date you enter.</p></section>
    <section><h2>Check the source</h2><p>The index includes older editions and snapshots. Confirm current deadlines and rules with the relevant university office. See the <Link href="/updates">release notes</Link> for what changed in v1.5.</p></section>
  </SiteArticle>;
}
