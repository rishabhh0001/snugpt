import type { Metadata } from "next";
import Link from "next/link";
import { SiteArticle } from "@/components/SiteArticle";

export const metadata: Metadata = { title: "SNUGPT Privacy Policy" };

export default function PrivacyPage() {
  return <SiteArticle title="Privacy Policy">
    <section><h2>Chat and feedback</h2><p>SNUGPT processes your questions and recent chat context to retrieve sources and generate replies. Server records may include questions, answers, source references, session identifiers, IP addresses, and timestamps. Answer reports record the conversation and message identifiers, the action, and its time. Diagnostic reports can include your query, session details, and error information.</p></section>
    <section><h2>Service providers</h2><p>Vercel hosts the app and Neon stores the knowledge index and server records. NVIDIA receives text needed for embeddings and answer generation. When web search runs, the query is sent to the search provider. Google Analytics and Vercel Analytics are used to measure site usage.</p></section>
    <section><h2>Accounts and browser storage</h2><p>Email or user ID sign-in uses a session cookie. The account database stores an identifier and a password hash. Google and GitHub sign-in buttons are currently unavailable. The browser stores conversations and cached source excerpts in IndexedDB, and local storage can hold preferences. Chat export and local deletion are available in the chat interface.</p></section>
    <section><h2>Questions and deletion requests</h2><p>Deleting a browser conversation removes its local copy. For a request about server records or account information, use the <Link href="/contact">contact form</Link>. The form collects the details you submit so the maintainer can respond. Keep passwords, IDs, and sensitive personal information out of chat and reports.</p></section>
  </SiteArticle>;
}
