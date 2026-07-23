# 🏛️ B2B AI Platform - Multi-Tenant Local Sandbox

**Pusat Pengembangan Platform B2B Multi-Tenant Agen AI & WhatsApp Automation.**

---

## 📁 STRUKTUR FOLDER PROYEK

```
b2b-ai-platform/
├── web-portal/          # Web Admin Dashboard (Klien Upload PDF, Custom Prompt, Scan QR WA)
├── n8n-workflows/       # Workflow n8n Automation & Dynamic Routing Engine
├── anything-llm/        # Multi-Tenant Vector DB & Document Workspaces
├── wa-gateway/          # WhatsApp Gateway (Baileys / Evolution API)
├── docker/              # Docker Compose Setup (Run All Stack in 1 Command)
└── docs/                # Blueprint Arsitektur, Panduan Setup, & Document Specs
```

---

## 🚀 CHALENGES & CARA MENJALANKAN (LOCAL SANDBOX)

1. **Jalankan Stack Lokal (Docker Compose):**
   ```bash
   cd docker
   docker compose up -d
   ```

2. **Akses Dashboard Localhost:**
   * **Web Admin Portal:** `http://localhost:3000`
   * **n8n Automation Engine:** `http://localhost:5678`
   * **Anything LLM Workspace:** `http://localhost:3001`
   * **WA Gateway API:** `http://localhost:8080`
