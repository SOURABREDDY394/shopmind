Here's the full MD file:

markdown# 🏪 ShopMind AI — AI Business Manager for Small Shops

## Problem Statement
Small shop owners globally have zero intelligent tools to manage 
their business. They use WhatsApp for orders, paper for inventory, 
and guess for pricing. 63 million small businesses in India alone, 
500 million globally — 90% still use paper or basic Excel.

## Solution
ShopMind AI is a full-stack AI-powered business management platform 
built specifically for small shop owners. Simple, cheap, and smart.

## Tech Stack
- Frontend: React + Tailwind CSS + Recharts
- Backend: FastAPI (Python)
- AI: LangChain + OpenRouter (google/gemini-pro-latest)
- OCR: Tesseract / Google Vision API
- Database: Supabase (PostgreSQL)
- Auth: Google OAuth
- WhatsApp: Twilio WhatsApp API
- Deploy: Vercel + Render

## Modules

### 📦 Smart Inventory
- Track stock levels in real time
- Low stock alerts
- Auto reorder suggestions
- Supplier management

### 💰 Sales Analytics
- Daily/weekly/monthly revenue charts
- Best selling products
- Peak hours analysis
- Revenue vs expense tracking

### 🤖 AI Price Advisor
- Suggests optimal pricing based on demand
- Competitor price comparison
- Margin optimization
- Seasonal pricing recommendations

### 📊 Profit Calculator
- Real cost vs selling price
- Actual profit per product
- Monthly profit trends
- Loss detection alerts

### 👥 Customer Manager
- Track regular customers
- Purchase history per customer
- Credit/dues management
- Customer loyalty insights

### 📱 WhatsApp Orders
- Receive orders via WhatsApp
- Auto order confirmation
- Order status updates
- Daily order summary

### 🧾 Invoice Generator
- Create professional invoices instantly
- Send via WhatsApp/Email
- GST compliant
- Payment tracking

### 📈 Demand Predictor
- AI predicts next week's demand
- Seasonal trend analysis
- Stock recommendations
- Reduce wastage alerts

### 🗣 Multilingual AI Chat
- Ask business questions in any language
- Hindi, Telugu, Tamil, English supported
- Voice input support
- Instant business insights

### 📷 Receipt Scanner
- Scan supplier bills via camera
- Auto update inventory
- Extract price and quantity
- Expense tracking

## API Endpoints
- POST /inventory/add
- GET /inventory/list
- POST /sales/record
- GET /sales/analytics
- POST /ai/price-advisor
- POST /ai/demand-predict
- POST /invoice/generate
- POST /whatsapp/order
- POST /ocr/scan-receipt
- GET /customers/list
- POST /customers/add

## Folder Structure
shopmind-ai/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── PriceAdvisor.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Invoices.jsx
│   │   │   ├── WhatsAppOrders.jsx
│   │   │   ├── DemandPredictor.jsx
│   │   │   └── ReceiptScanner.jsx
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── api.js
│   └── package.json
├── backend/
│   ├── main.py
│   ├── modules/
│   │   ├── inventory.py
│   │   ├── sales.py
│   │   ├── price_advisor.py
│   │   ├── demand_predictor.py
│   │   ├── invoice_generator.py
│   │   ├── customer_manager.py
│   │   ├── whatsapp_orders.py
│   │   └── receipt_scanner.py
│   ├── utils/
│   │   ├── llm.py
│   │   └── supabase.py
│   └── requirements.txt
└── README.md

## LLM Config
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    model="google/gemini-pro-latest"
)
```

## Environment Variables
OPENROUTER_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
GOOGLE_VISION_API_KEY=
CLOUDINARY_URL=

## Resume Line
Built ShopMind AI — a full-stack AI business management platform 
for small shops with smart inventory, sales analytics, demand 
prediction, invoice generation and multilingual AI chat. 
Targeting 500M+ small businesses globally.
Tech: React, FastAPI, LangChain, Supabase, OpenRouter, Twilio.

## Status
🔄 In Development
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>ShopMind AI Architecture</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #080c18;
    font-family: 'Syne', sans-serif;
    color: #e0e6ff;
    padding: 40px 30px;
    min-height: 100vh;
  }
  .title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(90deg, #34d1a5, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
  }
  .subtitle {
    text-align: center;
    font-size: 0.65rem;
    font-family: 'JetBrains Mono', monospace;
    color: #3d4f7a;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  .diagram {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    max-width: 780px;
    margin: 0 auto;
  }
  .box {
    border-radius: 10px;
    padding: 10px 18px;
    text-align: center;
    border: 1px solid;
    width: 100%;
  }
  .box .label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .box .desc {
    font-size: 0.62rem;
    font-family: 'JetBrains Mono', monospace;
    opacity: 0.55;
  }
  .box.user { background: rgba(52,209,165,0.1); border-color: rgba(52,209,165,0.35); }
  .box.user .label { color: #34d1a5; }
  .box.frontend { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.35); }
  .box.frontend .label { color: #818cf8; }
  .box.backend { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); }
  .box.backend .label { color: #60a5fa; }
  .box.ai { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.3); }
  .box.ai .label { color: #fbbf24; }
  .box.storage { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25); }
  .box.storage .label { color: #f87171; }
  .box.external { background: rgba(100,116,139,0.08); border-color: rgba(100,116,139,0.2); }
  .box.external .label { color: #94a3b8; }
  .arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .arrow-line { width: 1.5px; height: 20px; background: #1e2a4a; }
  .arrow-head { width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 7px solid #1e2a4a; }
  .arrow-label { font-size: 0.58rem; font-family: 'JetBrains Mono', monospace; color: #2e3a5c; margin: 2px 0; letter-spacing: 0.05em; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 6px; }
  .chip { font-size: 0.58rem; font-family: 'JetBrains Mono', monospace; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #6b7fa8; }
  .row { display: flex; gap: 12px; width: 100%; }
  .row .box { flex: 1; }
  .split-arrows { display: flex; width: 100%; justify-content: space-around; }
  .split-arrow { display: flex; flex-direction: column; align-items: center; flex: 1; }
  .legend { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.05); }
  .legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.6rem; font-family: 'JetBrains Mono', monospace; color: #3d4f7a; }
  .legend-dot { width: 7px; height: 7px; border-radius: 2px; }
</style>
</head>
<body>

<div class="title">ShopMind AI — Architecture</div>
<p class="subtitle">Full Stack · AI · Real-time · Global</p>

<div class="diagram">

  <div class="box user" style="max-width:200px">
    <div class="label">👤 Shop Owner</div>
    <div class="desc">Web browser</div>
  </div>

  <div class="arrow">
    <div class="arrow-line"></div>
    <div class="arrow-label">HTTP / browser</div>
    <div class="arrow-head"></div>
  </div>

  <div class="box frontend">
    <div class="label">⚛️ Frontend — React + Tailwind (Vercel)</div>
    <div class="chips">
      <span class="chip">Dashboard</span>
      <span class="chip">Inventory</span>
      <span class="chip">Sales Analytics</span>
      <span class="chip">Invoices</span>
      <span class="chip">Customers</span>
      <span class="chip">WhatsApp Orders</span>
      <span class="chip">Receipt Scanner</span>
    </div>
  </div>

  <div class="arrow">
    <div class="arrow-line"></div>
    <div class="arrow-label">REST API / JSON</div>
    <div class="arrow-head"></div>
  </div>

  <div class="box backend">
    <div class="label">⚡ Backend — FastAPI (Render)</div>
    <div class="chips">
      <span class="chip">Inventory API</span>
      <span class="chip">Sales API</span>
      <span class="chip">Invoice API</span>
      <span class="chip">Customer API</span>
      <span class="chip">WhatsApp API</span>
      <span class="chip">OCR / Scan</span>
      <span class="chip">Auth Service</span>
    </div>
  </div>

  <div class="split-arrows">
    <div class="split-arrow">
      <div class="arrow-line"></div>
      <div class="arrow-label">invoke</div>
      <div class="arrow-head"></div>
    </div>
    <div class="split-arrow">
      <div class="arrow-line"></div>
      <div class="arrow-label">read/write</div>
      <div class="arrow-head"></div>
    </div>
  </div>

  <div class="row">
    <div class="box ai">
      <div class="label">🧠 AI Layer</div>
      <div class="chips">
        <span class="chip">LangChain</span>
        <span class="chip">Gemini Pro</span>
        <span class="chip">Price Advisor</span>
        <span class="chip">Demand Predictor</span>
        <span class="chip">Multilingual Chat</span>
        <span class="chip">JSON Parser</span>
      </div>
    </div>
    <div class="box storage">
      <div class="label">🗄️ Storage</div>
      <div class="chips">
        <span class="chip">Supabase (PostgreSQL)</span>
        <span class="chip">ChromaDB (Vectors)</span>
        <span class="chip">Cloudinary (Files)</span>
        <span class="chip">Google Vision (OCR)</span>
        <span class="chip">Redis (Cache)</span>
      </div>
    </div>
  </div>

  <div class="split-arrows" style="margin-top:0">
    <div class="split-arrow">
      <div class="arrow-line"></div>
      <div class="arrow-label">orders</div>
      <div class="arrow-head"></div>
    </div>
    <div class="split-arrow">
      <div class="arrow-line"></div>
      <div class="arrow-label">stream logs</div>
      <div class="arrow-head"></div>
    </div>
  </div>

  <div class="row">
    <div class="box external">
      <div class="label">📱 Twilio</div>
      <div class="desc">WhatsApp orders</div>
    </div>
    <div class="box external">
      <div class="label">📊 Monitoring</div>
      <div class="desc">Sentry + Render logs</div>
    </div>
  </div>

  <div class="legend">
    <div class="legend-item"><div class="legend-dot" style="background:#34d1a5"></div> User</div>
    <div class="legend-item"><div class="legend-dot" style="background:#6366f1"></div> Frontend</div>
    <div class="legend-item"><div class="legend-dot" style="background:#60a5fa"></div> Backend</div>
    <div class="legend-item"><div class="legend-dot" style="background:#fbbf24"></div> AI Layer</div>
    <div class="legend-item"><div class="legend-dot" style="background:#f87171"></div> Storage</div>
    <div class="legend-item"><div class="legend-dot" style="background:#94a3b8"></div> External</div>
  </div>

</div>

</body>
</html>