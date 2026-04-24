# Aritmetik Mahjong - MVP Geliştirme Planı

Bu plan, `MVP Kapsam Dokümanı.md` içeriğine göre kodlamaya başlamadan önce proje kurulumunu ve geliştirme sırasını netleştirir.  
Hedef: 2-3 haftada, çekirdek oyun döngüsünü çalışır hale getirip Vercel üzerinde canlıya almak.

## 1) Mimari Yaklaşım (MVP)

- MVP'de ana ürün **frontend-first** geliştirilecektir.
- Oyun mantığı, state ve seviye akışı istemci tarafında çalışacaktır.
- Backend (FastAPI) bu fazda zorunlu değil; ancak sonraki sürümlere hazır olmak için minimal iskelet kurulacaktır.
- Kalıcı veri, auth, offline-first, anti-cheat ve gelişmiş puanlama MVP kapsamı dışıdır.

## 2) Önerilen Klasör Yapısı

```txt
arithmetic-pairing/
  frontend/                      # Next.js (App Router) + TypeScript
    src/
      app/
        page.tsx
        game/
          page.tsx
      components/
        ui/
        game/
      features/
        board/
        tiles/
        matching/
        modals/
      store/
        gameStore.ts
      engine/
        expression/
          generator.ts
          evaluator.ts
        mahjong/
          boardRules.ts
          deadlock.ts
          layouts.ts
      types/
        game.ts
        tile.ts
      lib/
        constants.ts
        utils.ts
    public/
    tests/
      unit/
      integration/
    package.json
    tailwind.config.ts
    next.config.ts

  backend/                       # FastAPI (MVP'de pasif/placeholder)
    app/
      main.py
      api/
        health.py
      core/
        config.py
      schemas/
      services/
    tests/
    requirements.txt
    pyproject.toml

  docs/
    architecture.md
    game-rules.md
    api-contract.md              # Gelecek sürümler için sözleşme taslağı

  .gitignore
  README.md
  PLAN.md
```

## 3) Kurulacak Paketler

## 3.1 Frontend (Next.js)

Temel:
- `next`
- `react`
- `react-dom`
- `typescript`
- `zustand`
- `tailwindcss`
- `postcss`
- `autoprefixer`

UI/yardımcı:
- `clsx`
- `tailwind-merge`

Kalite/test:
- `eslint`
- `eslint-config-next`
- `prettier`
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`

## 3.2 Backend (FastAPI)

Temel:
- `fastapi`
- `uvicorn[standard]`
- `pydantic`
- `python-dotenv`

Kalite/test:
- `pytest`
- `httpx`
- `ruff`

> Not: MVP'de frontend bağımsız çalışacak. Backend sadece sağlık kontrolü (`/health`) ve ileride genişleme için iskelet olarak tutulur.

## 4) Geliştirme Fazları (Adım Adım)

## Aşama 1 - Init ve Repo Kurulumu

Hedef: Monorepo benzeri yapı + temel çalışma standartları.

Adımlar:
1. Kök dizinde `frontend/` ve `backend/` klasörlerini oluştur.
2. `frontend` için Next.js + TypeScript + Tailwind kur.
3. `backend` için FastAPI proje iskeleti oluştur.
4. Ortak `.gitignore`, temel `README.md`, çalışma komutları ekle.
5. Frontend ve backend için ayrı `env.example` dosyaları hazırla.

Çıktı:
- Her iki uygulama lokal ortamda ayağa kalkar.
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000/health`

## Aşama 2 - UI İskeleti ve Sayfa Akışı

Hedef: Oyunun temel ekranlarını işlevsel ama sade şekilde hazırlamak.

Adımlar:
1. Landing ekranı: "Oyuna Başla" butonu.
2. Oyun ekranı: board alanı, skor alanı, seviye bilgisi, timer alanı (MVP timer opsiyonel görsel olabilir).
3. Modallar: "Kazandın", "Kaybettin", "Yeniden Oyna".
4. Tile bileşeni: seçilebilir/seçilemez durum görselleştirmesi.
5. Hatalı eşleşmede kısa titreşim/animasyon efekti.

Çıktı:
- DoD madde 1 ve görsel altyapının büyük kısmı hazır olur.

## Aşama 3 - Core Logic: Veri Modelleri ve State

Hedef: Oyun durumunu tek bir kaynaktan yönetmek.

Adımlar:
1. `Tile`, `Position`, `Layout`, `GameState` tiplerini tanımla.
2. Zustand store kur:
   - aktif layout
   - tile listesi
   - seçili 2 taş
   - skor
   - oyun durumu (`idle`, `playing`, `won`, `lost`)
3. Aksiyonlar:
   - `startGame`, `restartGame`
   - `selectTile`, `clearSelection`
   - `removeMatchedTiles`
   - `updateScore`
4. Sayfa yenilemede state reset davranışını netleştir (MVP gereği).

Çıktı:
- Oyun state akışı stabil hale gelir.

## Aşama 4 - Lite Expression Engine

Hedef: 99 sınırında matematik ifadeleri üretmek ve değerlendirmek.

Adımlar:
1. Operatör seti: `+`, `-`, `*` (bölme yok).
2. Sonuç aralığı: `0-99` (negatif sonuç üretmeyecek kural tercih edilebilir).
3. İfade üretici:
   - aynı sonuca sahip farklı ifade çiftleri üretir
   - örnek: `12+4` ve `8*2`
4. Güvenli evaluator (parse + hesaplama).
5. Unit test:
   - doğru hesap
   - sınır değerler
   - geçersiz ifade reddi

Çıktı:
- Eşleşme doğrulama için güvenilir matematik motoru hazır olur.

## Aşama 5 - Mahjong Kuralları ve Board Motoru

Hedef: Mahjong'un tıklanabilirlik kuralını doğru uygulamak.

Adımlar:
1. 3 hardcoded layout ekle: Kolay, Orta, Zor.
2. 3D grid pozisyon modeli (`x, y, z`) tanımla.
3. "Seçilebilir taş" kuralı:
   - üstünde taş olmayacak
   - en az bir yanı (sol/sağ) boş olacak
4. Board render:
   - seçilebilir taşlar aktif
   - seçilemez taşlar pasif gösterim
5. Deadlock kontrolü:
   - eşleşebilir hamle yoksa kaybetme durumuna geç

Çıktı:
- DoD madde 2'nin kural tarafı tamamlanır.

## Aşama 6 - Eşleştirme, Skorlama ve Oyun Döngüsü

Hedef: Çekirdek oyun deneyimini tamamlamak.

Adımlar:
1. Kullanıcı iki taş seçtiğinde:
   - iki ifade sonucu eşitse taşları kaldır
   - eşit değilse seçimi temizle + hata animasyonu
2. Skor:
   - doğru eşleşme `+10`
   - yanlış eşleşme `-5`
3. Kazanma koşulu:
   - tüm taşlar temizlenince "Kazandın" modalı
4. Kaybetme koşulu:
   - deadlock oluşunca "Kaybettin" modalı
5. "Yeniden Oyna" butonu:
   - aynı layout veya yeni layout ile temiz başlangıç

Çıktı:
- DoD madde 3 ve 4 tamamlanır.

## Aşama 7 - Test, Stabilizasyon ve Yayın

Hedef: MVP'yi güvenle canlıya almak.

Adımlar:
1. Kritik akış testleri:
   - oyun başlatma
   - geçerli/Geçersiz eşleştirme
   - kazanma/kaybetme
   - restart akışı
2. Basit performans kontrolü (özellikle board render).
3. Hata logging ve kullanıcıya sade hata mesajları.
4. Vercel deploy ve smoke test.
5. Kabul kriterleri checklist ile final doğrulama.

Çıktı:
- Canlı MVP yayını + demo bağlantısı.

## 5) MVP Dışı İşler için Teknik Hazırlık (Opsiyonel)

Bu adımlar MVP teslimini geciktirmeden "not" seviyesinde tutulur:
- Backend API sözleşmesi taslağı (`docs/api-contract.md`)
- Gelecek: skor kaydı, auth, leaderboard, anti-cheat için teknik borç listesi
- Refactor backlog (TPRD v2.0 geçişi)

## 6) Önerilen Sprint Takvimi (2-3 Hafta)

- Gün 1-2: Aşama 1
- Gün 3-5: Aşama 2 + 3
- Gün 6-9: Aşama 4 + 5
- Gün 10-12: Aşama 6
- Gün 13-15: Aşama 7 + canlıya alma

## 7) Done Checklist (MVP)

- "Oyuna Başla" ekranı ve oyun sayfası çalışıyor.
- 3D kuralına göre seçilebilir/seçilemez taş ayrımı doğru.
- Matematiksel sonuç eşleşmesi doğru çalışıyor.
- Doğru/yanlış eşleştirmede skor güncelleniyor.
- Tüm taşlar bitince kazanma, hamle kalmayınca kaybetme modalı çıkıyor.
- Restart ile oyun yeniden başlıyor.
- Vercel linki üzerinden oyuna erişilebiliyor.
