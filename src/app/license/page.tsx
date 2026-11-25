import type { Metadata } from "next";
import { SiteArticle } from "@/components/SiteArticle";

export const metadata: Metadata = { title: "SNUGPT Software License" };

export default function LicensePage() {
  return <SiteArticle title="Software License">
    <section><h2>Apache License 2.0</h2><p>SNUGPT’s source code is distributed under the Apache License, Version 2.0. It permits use, modification, and redistribution subject to its conditions. For the exact terms and notices, read the <a href="https://github.com/rishabhh0001/snugpt/blob/master/LICENSE">repository LICENSE file</a> and the <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache Software Foundation license text</a>.</p></section>
    <section><h2>University material and dependencies</h2><p>University handbooks, prospectuses, newsletters, branding, and other third-party material have their own rights and terms. The project’s software license does not grant rights to redistribute those materials. Software dependencies retain their respective licenses.</p></section>
    <section><h2>Project attribution</h2><p>Copyright © 2026 SNUGPT. Maintained by Rishabh Joshi. See the <a href="https://github.com/rishabhh0001/snugpt">source repository</a> for code and contributions.</p></section>
  </SiteArticle>;
}
