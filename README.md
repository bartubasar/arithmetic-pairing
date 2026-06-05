# 🀄 Arithmetic Pairing (Aritmetik Mahjong)

**Arithmetic Pairing**, oyuncuların zihinsel farkındalığını (mindfulness) artırmak ve odaklanma becerilerini geliştirmek amacıyla tasarlanmış, bilişsel yükü minimumda tutan minimalist bir Mahjong-Aritmetik eşleştirme oyunudur. Tasarım felsefesi olarak "olabildiğince sade" (Jade & Ivory renk paleti) bir yaklaşım benimsenmiştir.

---

## 🎯 Proje Vizyonu ve Özellikler

Oyun, klasik Mahjong mekanikleriyle matematiksel problem çözme yeteneğini harmanlar. Oyuncuların sadece doğru sonucu bulması yetmez, aynı zamanda tahtanın stratejik yapısını da çözmeleri gerekir.

### 🎲 Oyun Mekanikleri
* **Mahjong Kuralları:** Taşların seçilebilir olması için üstünün açık olması ve sağ/sol kenarlarından en az birinin boş olması zorunludur.
* **Dinamik Negatif Puanlama:** Skor sıfırın altına düşebilir. Hatalı eşleşmeler (-25) ve geçen her saniye (-1) puan kaybettirir.
* **İpucu (Hint) Cezası:** "Farkındalık" felsefesini korumak adına, ipucu kullanımı anında -10 puanlık bir cezaya tabidir.

### 🧠 Yapay Zeka Entegrasyonu (Flow State Engine)
Uygulama, oyuncunun "Akış" (Flow) durumunu korumak için bir yapay zeka algoritması kullanır. 
* Oyuncu bir bölümü bitirdiğinde, arka plandaki AI motoru (FastAPI üzerinden) oyuncunun hata sayısını ve tamamlama süresini analiz eder.
* Performansa göre bir sonraki bölümün **matematiksel karmaşıklığını** (sadece toplama/çıkarma veya çarpma/bölme ağırlıklı) ve **hibrit hata toleransını** dinamik olarak ayarlar. Oyuncu zorlanıyorsa sistem kolaylaşır, çok kolaysa zorlaşır.

---

## 💻 Teknoloji Yığını (Tech Stack)

* **Frontend:** Next.js, React, Tailwind CSS
* **Backend & AI Engine:** FastAPI, Python, Pydantic
* **Veritabanı & Yetkilendirme:** Supabase (PostgreSQL, Supabase Auth, Row Level Security)

---

## 🚀 Kurulum Adımları (Lokal Geliştirme)

### 1. Supabase ve Ortam Değişkenleri
Frontend dizinindeki `.env.local` dosyasına Supabase bilgilerinizi ekleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Backend (FastAPI & AI Engine) Ayağa Kaldırma
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*Backend `http://127.0.0.1:8000` adresinde çalışacaktır.*

### 3. Frontend (Next.js) Ayağa Kaldırma
Yeni bir terminal sekmesinde:
```bash
cd frontend
npm install
npm run dev
```
*Frontend `http://localhost:3000` adresinde çalışacaktır.*
