# News Analytics AI (Signal Analysis)

**Professional Financial News Analysis Platform**

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://news.saa-alliance.com)
[![Tech Stack](https://img.shields.io/badge/Stack-Python%20%2B%20Go-blue)](./app.py)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Overview

**News Analytics AI (Signal Analysis)** is a professional analytical platform for analyzing financial news and creating investment signals. The system automatically collects news from RSS feeds, analyzes them using AI (GPT-4, DeepSeek), determines market and sector impact, and provides a Terminal-style visual interface.

### Key Features

- Professional design with dark theme and gold accents
- **AI Analysis** - Integration with NVIDIA API (DeepSeek R1 Reasoning Model)
- **20+ Sectors** - From cryptocurrencies to biotech and energy
- **Multi-Language** - Full support for Russian and English
- **Telegram Integration** - Automatic publication of professional digests
- **Smart Filtering** - By impact, confidence, sentiment, sectors
- **Data Export** - CSV and PDF formats for further analysis
- **Auto-Update** - News collection every hour
- **High Performance** - Async/await, connection pooling

---

## 🏗️ Architecture

```
RSS Feeds → Python Backend (18080) → SQLite → Nginx → Web Browser
              ↓                        ↓
        NVIDIA API                Telegram
    (DeepSeek R1 Reasoning)          Bot
```

### Backend Services

- **Python 3.10+** (Port 18080) - FastAPI backend for news ingestion, AI analysis, and API
  - FastAPI, uvicorn, httpx, feedparser
  - Async/await architecture
  - Automatic news collection every hour
  - LLM integration (GPT-4, DeepSeek, Grok)
  
- **Go 1.21+** (Port 8090) - High-performance dashboard server
  - 10x faster than Python version
  - Gin web framework
  - Server-side rendering
  - Real-time statistics

- **SQLite 3** - Database with WAL mode for concurrent access

### AI/LLM

- **NVIDIA API** - DeepSeek R1 Reasoning Model (via NVIDIA API)
  - Advanced reasoning capabilities
  - High-quality market analysis
  - Multilingual support (English/Russian)

### Frontend

- **TypeScript/React** - Modern component-based UI (`src/components/`)
- **i18n System** - Full RU/EN localization with React Context
- **HTML5 + CSS3**
- **Go Templates** - Server-side rendered dashboard

---

## 🚀 Live Demo

**Production URL:** [https://news.saa-alliance.com](https://news.saa-alliance.com)

### Features Demonstrated

1. **News Collection**
   - Automatic monitoring of 20+ RSS feeds
   - Updates every hour
   - Deduplication by URL hash
   - ~90 news items per hour

2. **AI Analysis**
   - Parallel processing via LLM
   - Extraction: sector, tickers, entities
   - Metrics: impact (0-100), confidence (0-100), sentiment (-1/0/+1)
   - Translation to Russian
   - Deep market impact analysis

3. **Dashboard**
   - Filters by all parameters
   - Real-time statistics
   - Detailed view of each news item
   - Export to CSV/PDF

4. **Telegram Bot**
   - Automatic digests
   - Professional formatting
   - Top news of the day
   - Tomorrow's events

---

## 📸 Screenshots

![Dashboard](./screenshots/dashboard.png)
![News Analysis](./screenshots/analysis.png)
![Telegram Digest](./screenshots/telegram.png)

---

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.10+
- Go 1.21+ (for dashboard)
- Node.js 18+ (for TypeScript/React components and tests)
- SQLite 3

### Installation

```bash
# Navigate to project directory
cd ~/signal-analysis

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (for frontend components and tests)
npm install

# Build Go dashboard
cd go-signal-analysis
go mod tidy
go build -o signal-analysis-server
cd ..

# Configure API keys
cp env.example .env
nano .env  # Add your API keys
```

### Required Environment Variables

```env
# NVIDIA API (required)
NVIDIA_API_KEY=your-nvidia-api-key-here
# Get your key at: https://build.nvidia.com/

# Telegram (optional)
TELEGRAM_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_RU=@your_channel
```

### Running

```bash
# Automatic start (recommended) - starts both Python and Go servers
./manage_services.sh start

# Or manual start
# Python backend (port 18080)
python run.py

# Or using systemd (production)
sudo systemctl start signal-analysis-api
```

### Verification

```bash
# Service status (shows both Python and Go servers)
./manage_services.sh status

# Check service status
sudo systemctl status signal-analysis-api

# Open Dashboard
open https://news.saa-alliance.com
```

**🌐 Production Dashboard**: https://news.saa-alliance.com  
**📡 API**: https://news.saa-alliance.com/signals  
**📖 Swagger**: https://news.saa-alliance.com/docs  
**🏥 Health Check**: https://news.saa-alliance.com/health

---

## 📊 API Endpoints

```bash
# List signals
GET /signals?sector=CRYPTO&min_impact=80

# System status
GET /health

# Start news collection
POST /ingest-run

# Telegram digest
GET /telegram-digest?send=true

# Export
GET /export/signals.csv
GET /export/signals.pdf
```

**Full API Documentation**: https://news.saa-alliance.com/docs

---

## 🎯 Supported Sectors (9 Active)

✅ **TREASURY** - Regulators (SEC, Fed, central banks)  
✅ **CRYPTO** - Cryptocurrencies  
✅ **BIOTECH** - Biotechnology and FDA  
✅ **SEMIS** - Semiconductors  
✅ **ENERGY** - Energy and oil  
✅ **FINTECH** - Financial technologies  
✅ **COMMODITIES** - Commodities  
✅ **EMERGING_MARKETS** - Emerging markets  
✅ **TECHNOLOGY** - Technology  

---

## 📈 Metrics

- **Impact (0-100)** - Market impact score
- **Confidence (0-100)** - Source reliability and analysis confidence
- **Sentiment (-1/0/+1)** - Market sentiment (-1=bearish, 0=neutral, +1=bullish)

---

## 🔧 Management

### Service Management (macOS)

The project includes automatic service management with launchd for macOS:

```bash
# Service management
./manage_services.sh start      # Start both Python (8080) and Go (8090) servers
./manage_services.sh stop       # Stop both servers
./manage_services.sh restart    # Restart both servers
./manage_services.sh status     # Check status of both servers
./manage_services.sh logs python # View Python server logs
./manage_services.sh logs go    # View Go server logs
```

**Auto-start**: Services automatically start on macOS boot via launchd agents.

### Development Commands

```bash
# Python backend
python run.py                   # Start Python server manually
python debug.py                 # Full system diagnostics

# Go dashboard
cd go-signal-analysis
go run main.go                  # Start Go server manually
go build -o signal-analysis-server  # Build binary

# Frontend development
npm test                        # Run Jest tests
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Run Playwright with UI

# Logs
tail -f app.log                 # Python server logs
tail -f server.log              # Go server logs
```

---

## 🚢 Production Deployment

### Production Deployment (Ubuntu Server)

```bash
# Domain: news.saa-alliance.com

# Deploy with systemd
sudo systemctl start signal-analysis-api
sudo systemctl enable signal-analysis-api
sudo systemctl status signal-analysis-api

# Configure Nginx
# Location: /etc/nginx/sites-enabled/news.saa-alliance.com
```

### Nginx Configuration

```nginx
server {
    server_name news.saa-alliance.com;
    
    location / {
        proxy_pass http://127.0.0.1:18080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

---

## 🔐 Security

- Localhost only (127.0.0.1) in development
- API keys in .env (not in code)
- SQL injection protection (Pydantic)
- Detailed logging of all operations
- Rate limiting via semaphore

---

## 📈 Performance

### Optimizations

- ⚡ **Async/await** for all I/O operations (Python)
- 🚀 **Go dashboard** - 10x faster than Python version
- 🔄 **Retry logic** with exponential backoff
- 📊 **Connection pooling** for database
- 🎯 **Batch processing** for analysis
- 🔒 **Pipeline lock** for serialization
- 💾 **WAL mode** for SQLite (concurrent reads/writes)
- ⚙️ **Semaphore** for concurrency limiting (max 2 parallel LLM calls)

### Metrics

| Operation | Time |
|-----------|------|
| RSS loading | ~500ms |
| LLM analysis (NVIDIA/DeepSeek R1) | ~5-15s (includes reasoning) |
| SQL INSERT | <5ms |
| SQL SELECT | <50ms |
| Go Dashboard load | <50ms |
| Python Dashboard load | <100ms |
| Go API response | <20ms |

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm test                        # Run all tests
npm run test:watch              # Watch mode
```

Tests located in `__tests__/`:
- `dedupe.test.ts` - Deduplication logic
- `text.test.ts` - Text processing utilities

### E2E Tests (Playwright)

```bash
npm run test:e2e               # Run E2E tests
npm run test:e2e:ui            # Run with UI
```

Tests located in `playwright/`:
- `i18n.spec.ts` - Internationalization tests

---

## 📁 Project Structure

```
signal-analysis/
├── app.py                      # Python FastAPI backend (port 18080)
├── run.py                      # Python server entry point
├── requirements.txt            # Python dependencies
├── manage_services.sh          # Service management script (macOS)
│
├── src/                        # TypeScript/React frontend components
│   ├── components/             # React components (Badges, NewsCard)
│   ├── context/                # React Context (LocaleProvider)
│   ├── i18n/                   # Internationalization
│   ├── api/                    # API client
│   ├── services/               # Business logic
│   └── utils/                  # Utilities (dedupe, text)
│
├── __tests__/                  # Jest unit tests
├── playwright/                 # Playwright E2E tests
│
├── signals.db                  # SQLite database
├── app.log                     # Python server logs
└── server.log                  # Go server logs
```

## 📄 License

MIT License - Use freely!

---

## 👥 Author

**Scientific Analytics Alliance**

Premium Research & Wealth Intelligence Platform

---

## 🔗 Related Projects

- [Crypto Analytics Portal](../crypto_reports)
- [SAA Risk Analyzer](../saa-risk-analyzer)
- [SAA Learning Intelligence](../saa-learn-your-way)
- [Liquidity Positioner](../liquidity-positioner)

---

## 📚 Additional Documentation

- [START_HERE.md](START_HERE.md) - Quick start guide
- [SERVICES.md](SERVICES.md) - Service management details
- [go-signal-analysis/README.md](go-signal-analysis/README.md) - Go dashboard documentation

---

**Last Updated:** December 2025

**Production Domain:** news.saa-alliance.com  
**API Port:** 18080

> ⚠️ **Security Note**: This README contains example configuration only. All API keys shown are placeholders. Never commit real API keys or credentials to version control.

