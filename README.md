# 🧠 SnuGPT: The Next-Generation Institutional Knowledge Engine

![SnuGPT Architecture](https://img.shields.io/badge/Architecture-RAG-blue) ![Backend](https://img.shields.io/badge/Backend-FastAPI-green) ![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-blueviolet) ![Frontend](https://img.shields.io/badge/Frontend-React-61dafb)

SnuGPT is a highly-optimized, production-grade Retrieval-Augmented Generation (RAG) platform designed specifically to serve as a comprehensive knowledge interface for institutional environments. It seamlessly bridges the gap between massive, unstructured document repositories and users seeking precise, instantaneous, and contextually accurate answers.

By leveraging state-of-the-art embedding models, high-performance vector search, and secure persistence layers, SnuGPT transforms static data into a dynamic, conversational AI assistant.

---

## ✨ Core Capabilities

*   **Intelligent Retrieval-Augmented Generation**: Goes beyond standard LLM knowledge by instantly surfacing precise information from custom, proprietary knowledge bases (course catalogs, institutional policies, technical manuals).
*   **Secure Persistent Memory**: Integrates seamlessly with **Neon PostgreSQL** via `asyncpg`, ensuring all user interactions, AI responses, and conversational contexts are securely logged for future model training and compliance audits.
*   **Real-Time Streaming Inference**: Delivers answers instantly with token-by-token streaming, providing a fluid and engaging user experience identical to premium commercial AI platforms.
*   **Contextual Awareness**: Maintains conversational history via robust session tracking (`session_id`), allowing users to ask follow-up questions naturally without losing context.
*   **Responsive & Polished Interface**: A highly refined, mobile-responsive React frontend featuring smooth animations, dynamic styling, and an intuitive chat interface.

---

## 🎯 Primary Use Cases

### 1. The Ultimate Campus Concierge
Navigating university life can be overwhelming. SnuGPT acts as an ever-present, all-knowing digital concierge for students and faculty.
*   **Course Planning**: "What are the prerequisites for Advanced Machine Learning, and which professors are teaching it next semester?"
*   **Campus Policies**: "What is the procedure for appealing a parking ticket issued near the engineering block?"
*   **Student Life**: "When is the deadline to join the intramural robotics club, and where do they meet?"

### 2. Enterprise Knowledge Management
For organizations drowning in fragmented documentation, SnuGPT acts as a unified, intelligent search layer.
*   **HR Onboarding**: "Summarize our remote work equipment policy and tell me how to expense a new monitor."
*   **Technical Support**: "Find the troubleshooting steps for the 'Error 504' on the legacy billing server from the 2023 engineering wiki."

### 3. Continuous AI Self-Improvement
SnuGPT doesn't just answer questions; it learns.
*   **Feedback Loops**: By securely logging user IPs, queries, and AI responses into Neon PostgreSQL, the platform builds a rich dataset of edge-case questions and user behaviors.
*   **Fine-Tuning**: Data engineers can utilize this persistent storage to continuously fine-tune underlying models, ensuring the AI becomes exponentially smarter and more aligned with user intent over time.

---

## 💬 Interaction Examples

**User:** "Can you summarize the late submission policy for CS101?"
**SnuGPT:** *"According to the CS101 Syllabus (Section 4.2): Late submissions are accepted up to 48 hours past the deadline. However, a 10% penalty is applied for each 24-hour period. Submissions beyond 48 hours will receive a zero unless accompanied by a verified medical certificate. Do you need the link to the medical certificate submission portal?"*

**User:** "Yes, please provide the link."
**SnuGPT:** *"You can submit your medical certificates through the student health portal here: `[Link to Portal]`. Please ensure it is submitted within 3 days of your missed deadline."*

---

## 🏗️ Architecture Overview

SnuGPT is built on a robust, decoupled architecture:
*   **Backend**: Python-powered FastAPI application ensuring high concurrency and strict type validation via Pydantic.
*   **RAG Pipeline**: Coordinates embedding generation, vector database querying (ChromaDB), and prompt construction before streaming to the LLM.
*   **Database Layer**: SQLAlchemy and `databases` running asynchronous operations against a Neon PostgreSQL cluster, ensuring zero blocking during real-time chats.
*   **Frontend**: A modern React application utilizing advanced state management to handle streaming text chunks and maintain a responsive UI.

---

## 📄 License

SNUGPT is distributed under the **Apache License 2.0**.

This project is open-source and free to use, modify, and distribute. The Apache 2.0 License allows for commercial use, modification, distribution, and patent use, provided that the original copyright notice and a copy of the license are included. 

For the complete legal text, please refer to the [LICENSE](./LICENSE) file in this repository.
