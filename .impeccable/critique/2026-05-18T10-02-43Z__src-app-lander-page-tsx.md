---
target: src/app/lander/page.tsx
total_score: 30
p0_count: 0
p1_count: 2
timestamp: 2026-05-18T10-02-43Z
slug: src-app-lander-page-tsx
---
# Design Critique: SnuGPT Landing & Chat Workspace

## Design Health Score
Usability audit conducted using Nielsen's 10 Usability Heuristics (0–4 scale).

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | **3/4** | Solid streaming response and progress states. Minor gap in identifying specific server-side vs client-side network failures. |
| 2 | Match System / Real World | **4/4** | Excellent domain-appropriate language ("hostels", "tuition", "admissions") tailored directly to university students. |
| 3 | User Control and Freedom | **4/4** | Very nice emergency exit via the interactive "Stop generating" button. |
| 4 | Consistency and Standards | **3/4** | Sidebar and chat spacing align beautifully. Standard Lucide icon conventions are followed. |
| 5 | Error Prevention | **2/4** | Deleting conversations in the sidebar is instantaneous and destructive, without confirmation dialogs. |
| 6 | Recognition Rather Than Recall | **4/4** | Active recent chat history is kept immediately visible. Quick-prompts prevent blank-slate anxiety. |
| 7 | Flexibility and Efficiency | **2/4** | Lack of keyboard accelerators (`Ctrl+K`/`Cmd+K` or `ArrowUp` to edit last query) or keyboard arrow navigation in the history sidebar. |
| 8 | Aesthetic and Minimalist Design | **3/4** | Very clean overall. Muted color tokens for borders and backgrounds are visually comfortable. |
| 9 | Error Recovery | **2/4** | Generic, cryptic connection error messages leave users guessing what went wrong when backend is disconnected. |
| 10 | Help and Documentation | **3/4** | Link to official snu.edu.in is transparent, but missing quick-tips/FAQ inside the app workspace. |
| **Total** | | **30/40** | **Good (Solid foundation, needs polish)** |

---

## Anti-Patterns Verdict

### LLM Assessment: AI Slop & Polish Review
The website represents a highly clean dark aesthetic, but it carries a few tells of automated creation:
* **The "AI Dark Mode" Palette Trap**: It relies heavily on absolute dark backgrounds `#050505` and SaaS-like violet/indigo glow backdrops. While visually striking, it doesn't quite reflect a personalized university connection (Shiv Nadar University's brand colors are actually Royal Blue and Yellow/Gold!).
* **Identical Cards Block**: The lander features grid is clean but slightly monotone in card scaling.
* **Positive Tells**: Using the gold/yellow hue (`#f2a900`) for chat accents and icons beautifully breaks out of first-order AI-slop stereotypes by anchoring to the university's authentic color identity.

### Deterministic Scan
The automated `impeccable detect` command returned the following results:
* **Valid Finding (Pure Black Backgrounds)**: `bg-black` (#000000) was detected in `lander/page.tsx` and `QuickActions.tsx`. Pure black backgrounds create severe visual contrast and eye fatigue. They should be swapped with custom tinted dark neutrals.
* **Valid Finding (SaaS Palette Overload)**: `from-indigo-500` gradients and glows in the lander were flagged. We should integrate more SNU brand blue/gold accents to personalize it.
* **False Positive (Markdown Blockquote)**: `globals.css:54` flagged `border-left` inside `.prose-chat blockquote`. This is a false positive: blockquotes by standard markdown convention are styled with left borders. We will keep it but make it a bit more subtle.
* **False Positive (Text Gradient)**: `lander/page.tsx:579` flagged `bg-clip-text + bg-gradient`. The vertical fade from white to transparent white represents an elegant, hand-crafted vertical depth effect, not standard slop.

---

## Overall Impression
SnuGPT has a world-class foundation with very snazzy layouts, typing hooks, and clean spacing. The single biggest opportunity is transitioning from a "generic high-tech SaaS template" to a "custom Shiv Nadar University Intelligent Engine" by replacing raw `#000` with brand-tinted dark surfaces, customizing glows to the university's real blue/yellow palette, and adding keyboard shortcuts for quick usage.

---

## Persona Red Flags

### Jordan (Confused First-Timer)
* **Official Branding Check**: Jordan might feel nervous typing queries if it looks like an unofficial, generic third-party crawler. We should add a small badge confirming it checks the *official SNU Handbooks*.
* **Mobile Drawer Navigation**: Jordan may struggle with the mobile side menu icon which is tiny and placed far in the top corner.

### Riley (Deliberate Stress Tester)
* **Destructive Deletes**: If Riley clicks the trash icon in the sidebar, the entire conversation is deleted immediately without any dialog. This is a severe threat of data loss.
* **API Token Protection**: The text input field allows pasting massive text prompts without character limitations, which will overflow API context window sizes.

### Alex (Impatient Power User)
* **No Keyboard Accelerators**: Alex wants to navigate without moving his hands from the keyboard, but `Ctrl+K` does not open search, `ArrowUp` does not let him edit his last sent message, and there are no shortcuts to delete a chat or clear active workspace state.

---

## Priority Issues

### [P1] Instantly Destructive Conversation Deletions
* **Why it matters**: Accidental clicks on sidebar items can permanently lose conversation history, causing user frustration and distrust.
* **Fix**: Add a clean confirmation modal or inline state confirmation when deleting a chat.
* **Suggested Command**: `npx impeccable craft confirmation-dialog`

### [P1] Pure Black Visual Fatigue
* **Why it matters**: Raw `#000000` background causes harsh pixel contrast on modern displays, leading to cognitive fatigue during long reading sessions.
* **Fix**: Replace `#000000` and `bg-black` classes with a premium navy/slate-tinted neutral base: `oklch(12% 0.01 250)`.
* **Suggested Command**: `npx impeccable colorize background-tint`

### [P2] Missing Keyboard Shortcuts for Power Users
* **Why it matters**: Power users expect rapid chat control (e.g. `Ctrl+K` or `Cmd+K` to search/clear, or `ArrowUp` to edit the last query).
* **Fix**: Implement global keyboard event listeners for quick chat interface actions.
* **Suggested Command**: `npx impeccable polish keyboard-nav`

### [P2] Generic Tech-Glow Colors (SaaS Palette Trap)
* **Why it matters**: Purple/indigo glows make the application look like an AI template rather than an custom-engineered Shiv Nadar University service.
* **Fix**: Infuse SNU brand colors (Blue and Yellow/Gold) into the hover halos and glowing CTAs.
* **Suggested Command**: `npx impeccable colorize brand-sync`

---

## Questions to Consider
* What if the landing page hero specifically featured an official university policy search badge to establish authority?
* Does the sidebar chat history need simple categorization (e.g., "Today", "Yesterday", "Older") rather than a flat, raw list?
