# News Analytics AI (Signal Analysis)

**Professional Financial News Analysis Platform | Bloomberg Terminal Style**

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](http://104.248.70.69/signal-analysis)
[![Tech Stack](https://img.shields.io/badge/Stack-Python%20%2B%20Go-blue)](./app.py)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Overview

**News Analytics AI (Signal Analysis)** is a professional analytical platform for analyzing financial news and creating investment signals. The system automatically collects news from RSS feeds, analyzes them using AI (GPT-4, DeepSeek), determines market and sector impact, and provides a Bloomberg Terminal-style visual interface.

### Key Features

- **Bloomberg-style UI** - Professional design with dark theme and gold accents
- **AI Analysis** - Integration with OpenAI GPT-4, DeepSeek, and xAI Grok
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
RSS Feeds → Python Backend → SQLite → Go Dashboard → Web Browser
              ↓                ↓
           LLM API          Telegram
         (GPT-4/DeepSeek)      Bot
```

### Backend

- **Python 3.10+** - FastAPI, uvicorn, httpx, feedparser
- **Go 1.21+** - Fast Dashboard (10x faster)
- **SQLite 3** - Database with WAL mode

### AI/LLM

- **OpenAI GPT-4** - Professional quality analysis
- **DeepSeek** - 70x cheaper! (recommended)
- **xAI Grok** - Experimental

### Frontend

- **HTML5 + CSS3** - Embedded in app.py
- **Vanilla JavaScript** - No frameworks
- **i18n System** - RU/EN localization

---

## 🚀 Live Demo

**Production URL:** [http://104.248.70.69/signal-analysis](http://104.248.70.69/signal-analysis)

### Features Demonstrated

1. **News Collection**
   - Automatic monitoring of 20+ RSS feeds
   - Updates every hour
   - Deduplication by URL hash
   - ~90 news items per hour

2. **AI Analysis**
   - Parallel processing via LLM
   - Extraction: sector, tickers, entities
   - Metrics: impact (0-100), confidence (0-100), sentiment (0-100)
   - Translation to Russian
   - Deep market impact analysis

3. **Dashboard**
   - Bloomberg-style design
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
- Go 1.21+ (optional, for dashboard)
- SQLite 3

### Installation

```bash
# Navigate to project directory
cd ~/signal-analysis

# Install dependencies
pip install -r requirements.txt

# Configure API keys
cp env.example .env
nano .env  # Add your API keys
```

### Required Environment Variables

```env
# LLM API (at least one)
OPENAI_API_KEY=sk-your-openai-key-here
DEEPSEEK_API_KEY=sk-your-deepseek-key-here  # Recommended (70x cheaper!)

# Telegram (optional)
TELEGRAM_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_RU=@your_channel
```

### Running

```bash
# Automatic start (recommended)
./manage_services.sh start

# Or manual start
python run.py
```

### Verification

```bash
# Service status
./manage_services.sh status

# Open Dashboard
open http://localhost:8080/dashboard?lang=ru
```

**🌐 Dashboard**: http://localhost:8080/dashboard?lang=ru  
**📡 API**: http://localhost:8080/signals  
**📖 Swagger**: http://localhost:8080/docs

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

**Full API Documentation**: http://localhost:8080/docs

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

- **Impact (0-100)** - Market impact
- **Confidence (0-100)** - Source reliability
- **Sentiment (0-100)** - Market sentiment (0=negative, 100=positive)

---

## 🔧 Management

### Commands

```bash
# Service management
./manage_services.sh start      # Start
./manage_services.sh stop       # Stop
./manage_services.sh restart    # Restart
./manage_services.sh status     # Status
./manage_services.sh logs python # Python logs
./manage_services.sh logs go    # Go logs

# Diagnostics
python debug.py                 # Full system diagnostics
tail -f app.log                 # Real-time logs
```

---

## 🚢 Production Deployment

### Digital Ocean Deployment

```bash
# Build and deploy
python run.py

# Deploy with PM2
pm2 start app.py --name signal-analysis-api --interpreter python3

# Configure Nginx
# Location: /etc/nginx/sites-enabled/signal-analysis-dashboard
```

### Nginx Configuration

```nginx
location /signal-analysis {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
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

- ⚡ **Async/await** for all I/O operations
- 🔄 **Retry logic** with exponential backoff
- 📊 **Connection pooling** for database
- 🎯 **Batch processing** for analysis
- 🔒 **Pipeline lock** for serialization
- 💾 **WAL mode** for SQLite
- ⚙️ **Semaphore** for concurrency limiting

### Metrics

| Operation | Time |
|-----------|------|
| RSS loading | ~500ms |
| LLM analysis (DeepSeek) | ~1s |
| LLM analysis (GPT-4) | ~3s |
| SQL INSERT | <5ms |
| SQL SELECT | <50ms |
| Dashboard load | <100ms |

---

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
- [SAA Learn Your Way](../saa-learn-your-way)
- [Liquidity Positioner](../liquidity-positioner)

---

**Last Updated:** November 2025
