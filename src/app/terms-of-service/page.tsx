import type { Metadata } from "next";
import Link from "next/link";
import { SiteArticle } from "@/components/SiteArticle";

export const metadata: Metadata = { title: "SNUGPT Terms of Service" };

export default function TermsPage() {
  return <SiteArticle title="Terms of Service">
    <p>These terms apply when you use SNUGPT, an unofficial campus information service for the Shiv Nadar University community and applicants.</p>
    <section><h2>Academic and campus decisions</h2><p>Answers are generated from available sources, which can be incomplete or out of date. Consult current university documents and contact the relevant office before relying on an answer for grades, fees, attendance, admissions, or registration. Official university notices and decisions govern.</p></section>
    <section><h2>Acceptable use</h2><p>Use the service consistently with university academic integrity rules. Do not use it for cheating, plagiarism, unauthorized access, or disruption. Keep your login credentials private. The service may limit requests to keep chat available.</p></section>
    <section><h2>Availability and software license</h2><p>SNUGPT is provided as available for general information. Features and source coverage can change. See the <Link href="/privacy-policy">privacy policy</Link> for data handling and the <Link href="/license">license page</Link> for the terms that apply to the project’s source code.</p></section>
  </SiteArticle>;
}
