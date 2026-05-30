# SNUGPT Product Roadmap 🎓

Welcome to the SNUGPT development roadmap. SNUGPT is an advanced, RAG-driven student assistant tailored specifically for the Shiv Nadar University community. Below is the current trajectory, completed milestones, and future plans.

---

## 🚀 Completed Milestones & Core Features

### 🛡️ Phase 3: Administrative Control & Self-Cleaning Vector Stores [RECENTLY COMPLETED]
* **Dynamic Administrator Access Control**: Authorized administrator session validation through secure, NextAuth-linked logins.
* **Admin Knowledge Ingestion Portal**: A collapsible, dark glassmorphic ingestion panel directly inside the chat window, enabling verified admins to upload handbook files or type rules directly to ChromaDB with zero downtime.
* **Self-cleaning Chat Learning Engine**: Self-correcting feedback triggers that automatically purge stale duplicates or conflicting vector records before indexing updated reinforcement pairs.
* **BM25 Token Index Auto-Flush**: Automated BM25 index memory caching clears on knowledge ingestion for instant sub-second search availability.

### 🧠 Phase 2: RAG Pipeline Optimization
* **NVIDIA NeMo Reranking Core**: Re-ranking candidate study materials using hosted Cross-Encoder models down to the top 5 most relevant documents.
* **Temporal Query Expansion Engine**: Real-time academic semester context injection to prioritize active university policies over legacy guidelines.
* **Semantic Redis Caching**: Ultrafast, sub-millisecond query responses powered by semantic Redis caches.

### 🌐 Phase 1: Core Foundation & UI
* **Campus Intel Engine**: High-fidelity semantic vector searches across course manuals, admission guides, and student welfare handbooks.
* **Offline IndexedDB Retrieval**: Browser-native IndexedDB caching enabling local fallback searches when offline.
* **Dark Glassmorphism Interface**: A high-end dark interface matching premium, state-of-the-art startup standards.

---

## 🗺️ Future Horizon

### 📅 Phase 4: Rich Academic Integration (Next Up)
* `[ ]` **SNU ERP Portal Automation**: Secure scraping of individual academic schedules, attendance, and CGPA trends.
* `[ ]` **CDC Placement Metrics Tracker**: Interactive placement history and interview prep sheets based on previous Shiv Nadar CDC records.
* `[ ]` **Campus Map Navigation**: Real-time directions and block placements mapped directly in the chat bubble.

### 🔒 Phase 5: Privacy & Scale Hardening
* `[x]` **Document Sanitization Pipeline**: Auto-anonymization of student details in chat logs to comply with strict student privacy guidelines.
* `[x]` **Distributed Vector Ingestions**: Multi-tenant database pooling for concurrent queries during admissions seasons.
