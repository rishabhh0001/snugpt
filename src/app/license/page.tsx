"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, ArrowLeft, Download, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const fadeInUp = {
  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const APACHE_LICENSE_TEXT = `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.

"Legal Entity" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity. For the purposes of this definition, "control" means (i) the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or (ii) ownership of fifty percent (50%) or more of the outstanding shares, or (iii) beneficial ownership of such entity.

"You" (or "Your") shall mean an individual or Legal Entity exercising permissions granted by this License.

"Source" form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.

"Object" form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.

"Work" shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work (an example is provided in the Appendix below).

"Derivative Works" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship. For the purposes of this License, Derivative Works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work and Derivative Works thereof.

"Contribution" shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner. For the purposes of this definition, "submitted" means any form of electronic, verbal, or written communication sent to the Licensor or its representatives, including but not limited to communication on electronic mailing lists, source code control systems, and issue tracking systems that are managed by, or on behalf of, the Licensor for the purpose of discussing and improving the Work, but excluding communication that is conspicuously marked or otherwise designated in writing by the copyright owner as "Not a Contribution."

"Contributor" shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Work to which such Contribution(s) was submitted. If You institute patent litigation against any entity (including a cross-claim or counterclaim in a lawsuit) alleging that the Work or a Contribution incorporated within the Work constitutes direct or contributory patent infringement, then any patent licenses granted to You under this License for that Work shall terminate as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You meet the following conditions:

(a) You must give any other recipients of the Work or Derivative Works a copy of this License; and
(b) You must cause any modified files to carry prominent notices stating that You changed the files; and
(c) You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding those notices that do not pertain to any part of the Derivative Works; and
(d) If the Work includes a "NOTICE" text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file, excluding those notices that do not pertain to any part of the Derivative Works, in at least one of the following places: within a NOTICE text file distributed as part of the Derivative Works; within the Source form or documentation, if provided along with the Derivative Works; or, within a display generated by the Derivative Works, if and wherever such third-party notices normally appear. The contents of the NOTICE file are for informational purposes only and do not modify the License. You may add Your own attribution notices within Derivative Works that You distribute, alongside or as an addendum to the NOTICE text from the Work, provided that such additional attribution notices cannot be construed as modifying the License.

You may add Your own copyright statement to Your modifications and may provide additional or different license terms and conditions for use, reproduction, or distribution of Your modifications, or for any such Derivative Works as a whole, provided Your use, reproduction, and distribution of the Work otherwise complies with the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work by You to the Licensor shall be under the terms and conditions of this License, without any additional terms or conditions. Notwithstanding the above, nothing herein shall supersede or modify the terms of any separate license agreement you may have executed with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law (such as deliberate and grossly negligent acts) or agreed to in writing, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work (including but not limited to damages for loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses), even if such Contributor has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License. However, in accepting such obligations, You may act only on Your own behalf and on Your sole responsibility, not on behalf of any other Contributor, and only if You agree to indemnify, defend, and hold each Contributor harmless for any liability incurred by, or claims asserted against, such Contributor by reason of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS`;

export default function LicensePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-jakarta overflow-x-hidden selection:bg-amber-500/30 tracking-tight relative">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[350px] rounded-full bg-gradient-to-br from-indigo-500/10 via-indigo-600/5 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[250px] rounded-full bg-gradient-to-br from-amber-500/5 via-amber-600/5 to-transparent blur-[100px] pointer-events-none" />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" />

      {/* Top Header navbar simplified */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6">
          <Link href="/lander" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Image src="/avatar.svg" alt="SNUGPT" width={32} height={32} className="object-cover" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-sm font-black tracking-tighter uppercase leading-tight text-white">SNUGPT</span>
              <span className="text-[7px] font-bold text-indigo-400/60 tracking-[0.3em] uppercase">Delhi-NCR</span>
            </div>
          </Link>

          <Link href="/lander" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Page Body content container */}
      <main className="relative max-w-4xl mx-auto px-6 pt-32 pb-24 z-10 flex flex-col items-center">
        
        {/* Page Hero Introduction */}
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="w-full text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-[9px] font-black text-indigo-400 mb-6 uppercase tracking-widest">
            <Shield className="w-3 h-3 text-indigo-400" /> Open Source License
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-none">
            Apache License 2.0
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-base md:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            SNUGPT is released as open-source software under the Apache 2.0 license, providing you with full freedom to modify, distribute, and integrate its core modules.
          </motion.p>
        </motion.div>

        {/* Section 1: Summary of permissions */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-16 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
              <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Permissions
              </h3>
              <ul className="text-xs text-white/40 space-y-1.5 font-medium font-inter">
                <li>• Commercial Use permitted</li>
                <li>• Modification allowed</li>
                <li>• Distribution allowed</li>
                <li>• Sublicensing allowed</li>
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
              <h3 className="text-xs font-black tracking-widest text-amber-500 uppercase mb-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Limitations
              </h3>
              <ul className="text-xs text-white/40 space-y-1.5 font-medium font-inter">
                <li>• Must include license copy</li>
                <li>• Track changes in modifications</li>
                <li>• Retain original attributions</li>
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
              <h3 className="text-xs font-black tracking-widest text-red-400 uppercase mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Disclaimers
              </h3>
              <ul className="text-xs text-white/40 space-y-1.5 font-medium font-inter">
                <li>• No warranties provided</li>
                <li>• "AS IS" state distribution</li>
                <li>• No trademark rights granted</li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        {/* Section 2: Complete legal text scrolling block */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-16 space-y-4"
        >
          <motion.div variants={fadeInUp} className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight">Full Legal Text</h2>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">scrolling block</span>
          </motion.div>

          <motion.div variants={fadeInUp} className="w-full rounded-2xl border border-white/5 bg-white/[0.01] p-6 max-h-[500px] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-white/10 font-mono text-xs text-white/40 leading-relaxed whitespace-pre-wrap select-text relative group hover:border-white/10 transition-colors">
            {APACHE_LICENSE_TEXT}
          </motion.div>
        </motion.section>

        {/* Section 3: Copyright Declaration */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="w-full mb-12 space-y-6"
        >
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl">
            <h2 className="text-lg font-black text-white mb-4 tracking-tight flex items-center gap-2">
              Copyright Notice & Attribution
            </h2>
            <div className="text-sm text-white/40 leading-relaxed font-medium font-inter space-y-4">
              <p>
                Copyright <strong>2026 Rishabh Joshi</strong>.
              </p>
              <p>
                Licensed under the Apache License, Version 2.0 (the "License"); you may not use SnuGPT files except in compliance with the License. You may obtain a copy of the License at <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">http://www.apache.org/licenses/LICENSE-2.0</a>.
              </p>
              <p>
                Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Legal links footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full border-t border-white/5 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20 font-medium"
        >
          <span>&copy; {new Date().getFullYear()} Rishabh Joshi. Apache License 2.0.</span>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About SnuGPT</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </motion.footer>

      </main>
    </div>
  );
}
