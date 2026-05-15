# <img src="./public/avatar.svg" width="48" align="center" /> SNUGPT

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-RAG-indigo?style=for-the-badge&logo=ai" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Database-Neon_Postgres-blueviolet?style=for-the-badge&logo=postgresql" />
</p>

<p align="center">
  <strong>The Next-Generation Institutional Knowledge Engine.</strong><br />
  <em>Bridge the gap between unstructured data and precise, conversational intelligence.</em>
</p>

---

## ⚡ The SNUGPT Difference

SNUGPT is not just another chatbot. It is a production-grade **Retrieval-Augmented Generation (RAG)** platform designed to transform static institutional documentation into a dynamic, conversational knowledge base.

| Feature | Description |
| :--- | :--- |
| **🧠 Deep Context** | Surfacing precise info from course catalogs, policies, and manuals. |
| **🌊 Live Streaming** | Token-by-token response streaming for a commercial-grade feel. |
| **🛡️ Secure Memory** | Persistent session tracking with Neon PostgreSQL and asyncpg. |
| **📱 Premium UI** | Framer Motion animations and high-contrast dark mode aesthetics. |
| **🔄 Self-Improving** | Integrated feedback loops for continuous model alignment. |

---

## 🧠 Knowledge Base & Indexing

To feed SnuGPT with university-specific documents (PDFs, Markdown, Text):

1.  Place your documents in the `docs/` directory at the root of the project.
2.  Run the indexing script:
    ```bash
    python backend/scripts/index_docs.py
    ```
    This will chunk the documents and upload them to ChromaDB (local or cloud depending on your `.env`).

## 🛠️ Tech Stack & Architecture

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

## 🎯 Strategic Use Cases

### 🏫 The Campus Concierge
Acts as an all-knowing digital assistant for students.
- **Academic Planning**: Prerequisites, professor ratings, and credit requirements.
- **Administrative Navigation**: Hostel policies, parking appeals, and fee structures.
- **Dynamic FAQ**: "When is the deadline for the robotics club registration?"

### 🏢 Enterprise Knowledge Layer
Unified search for fragmented organizational intelligence.
- **HR Onboarding**: Policy summaries and expense procedures.
- **Tech Support**: Troubleshooting legacy server errors from internal wikis.

---

## 💬 Conversation Preview

> **User:** "What's the late submission policy for CSD101?"
>
> **SNUGPT:** *"According to the 2024 Syllabus, late submissions are accepted for 48 hours with a 10% daily penalty. Beyond 48 hours, a zero is awarded unless a medical certificate is provided. [View Source Document]"*

---

## 🚀 Development Roadmap

- [x] **Core RAG Pipeline**: PDF ingestion and vector indexing.
- [x] **Premium UI**: Framer Motion landing page (`/lander`).
- [x] **Streaming**: Token-by-token server-sent events.
- [ ] **Multi-Modal Support**: Analyzing images and charts in documents.
- [ ] **Department API**: Direct integration with university ERP systems.

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
