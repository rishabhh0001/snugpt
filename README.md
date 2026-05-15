# <img src="./public/avatar.svg" width="48" align="center" /> SNUGPT

<p align="center">
  <img src="https://img.shields.io/badge/Release-V1.0.4_Neural-indigo?style=for-the-badge&logo=rocket" />
  <img src="https://img.shields.io/badge/Architecture-RAG-indigo?style=for-the-badge&logo=ai" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Database-Neon_Postgres-blueviolet?style=for-the-badge&logo=postgresql" />
</p>

<p align="center">
  <strong>The Student Brain Engine.</strong><br />
  <em>The ultimate institutional intelligence layer for the SNU Ecosystem.</em>
</p>

---

## ⚡ The SNUGPT Overhaul (V1.0.4)

SNUGPT has been transformed from a standard chatbot into a high-density **Neural Intelligence Interface**. Designed for students who need precision without the noise.

### ✨ What's New?
- **🧠 Compact Neural UI**: Re-engineered for standard laptop viewports. Everything you need, visible at first glance.
- **✨ Character Reveal Engine**: High-fidelity text animations for a premium, conversational feel.
- **🌊 Ambient Neural Backgrounds**: Dynamic grid systems and pulsing ambient glows that respond to your presence.
- **🛡️ Built-in Guardrails**: University-aligned intelligence that respects academic integrity and institutional policies.
- **📱 Responsive by Design**: Seamlessly scaling from 4K workstations to mobile devices.

| Feature | Description |
| :--- | :--- |
| **🧠 Deep Context** | Surfacing precise info from course catalogs, policies, and manuals. |
| **🌊 Live Streaming** | Token-by-token response streaming for a commercial-grade feel. |
| **🛡️ Secure Memory** | Persistent session tracking with Neon PostgreSQL and asyncpg. |
| **📱 Premium UI** | Framer Motion animations and high-contrast dark mode aesthetics. |
| **🔄 Self-Improving** | Integrated feedback loops for continuous model alignment. |

---

## 🏗️ Architecture & Flow

```mermaid
graph TD
    User((User)) -->|HTTPS| Frontend[Next.js 14 / Tailwind]
    Frontend -->|Streaming API| Backend[FastAPI]
    Backend -->|Embedding| Llama 3.3[Meta]
    Backend -->|Vector Search| ChromaDB[(Chroma Vector DB)]
    Backend -->|Persistence| Neon[(Neon PostgreSQL)]
    ChromaDB ---|Index| Docs[PDFs / ERP Data / Web Crawls]
```

---

## 🚀 Getting Started

### 1. Feeding the Brain
Place your documents (PDFs, MD, TXT) in the `docs/` directory and index them:
```bash
python backend/scripts/index_docs.py
```

### 2. Launching the Interface
```bash
npm run dev
```

---

## 🎯 Strategic Use Cases

### 🏫 Academic Intelligence
- **Course Navigator**: Prerequisites, professor insights, and credit mapping.
- **Policy Oracle**: Instant answers on hostel rules, fee structures, and appeals.
- **Research Buddy**: Quickly surface relevant citations from institutional papers.

### 🏢 Organizational Layer
- **Unified Search**: Bridge the gap between fragmented ERP data and student queries.
- **Automated Support**: Reduce administrative load by resolving common queries instantly.

---

## 📄 License & Attribution

Copyright **2026 Rishabh Joshi**

Licensed under the **Apache License 2.0**. This project is open-source and free for commercial use, modification, and distribution, provided attribution is maintained.

> [!IMPORTANT]
> For the complete legal text, please refer to the [FULL LICENSE](./LICENSE) file.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/rishabhh0001">Rishabh Joshi</a>
</p>
