# Aritmetik Mahjong - Design System (Tailwind & CSS Adaptasyonu)

Bu doküman, sağlanan klasik Mahjong Solitaire HTML/CSS tasarım sisteminin, Next.js ve Tailwind CSS mimarisine uygun olarak (özellikle bilişsel yükü azaltan, net ve işlevsel bir UI kurgusuyla) uyarlanmış halidir. Cursor (veya başka bir IDE) bu dosyayı okuyarak `tailwind.config.ts` ve global CSS dosyalarını hatasız oluşturabilir.

## 1. Renk Paleti (Design Tokens)
Bu değişkenler `tailwind.config.ts` içerisindeki `theme.extend.colors` objesine eklenecektir.

* **Jade (Ana Tema & Başarı):**
    * `jade-50`: `#e8f7ef` (Eşleşen taş arka planı)
    * `jade-300`: `#5aab7e` (İkincil vurgular)
    * `jade-400`: `#3a8a5e` (Buton hover)
    * `jade-500`: `#2d6e4a` (Ana butonlar ve başarı durumları)
    * `jade-900`: `#0a1f14` (Çok koyu yeşil arka plan)
* **Ivory (Taş Yüzeyleri & Metin):**
    * `ivory-50`: `#fdf9f0` (Temel taş rengi)
    * `ivory-100`: `#f6f0de` (Ana metinler)
    * `ivory-300`: `#e0d0a8` (İkincil metinler ve 3D derinlik gölgesi)
    * `ivory-400`: `#cdb98a` (Taş kenarlıkları)
* **Gold (Skor, Kombo & Seçim):**
    * `gold-200`: `#f4d870` (HUD başlıkları)
    * `gold-300`: `#e8c040` (Seçili taş kenarlığı, Skor vurgusu)
* **Crimson (Hata & Uyarı):**
    * `crimson-400`: `#e52d4a` (Süre uyarısı, Hatalı eşleşme)
    * `crimson-500`: `#c41c36` (Önemli uyarı metinleri)
* **Semantik (Global):**
    * `bg-base`: `#0f1e15` (Uygulama arkaplanı)
    * `bg-surface`: `#162a1e` (Kartlar ve paneller)
    * `bg-elevated`: `#1e3828` (Modallar ve Toast bildirimler)

## 2. Tipografi Sistemi
Oyun ekranında karmaşayı önlemek ve aritmetik işlemlerin net okunmasını sağlamak için font ailesi sadeleştirilmiştir.

* **Display / Başlıklar (`font-display`):** `'Cinzel', 'Noto Serif', serif` (Oyun adı, büyük skorlar).
* **Aritmetik Taş İfadeleri (`font-tile`):** `'Noto Sans', sans-serif` (Sağlanan Çince karakterler yerine, matematiksel netlik için düz ve kalın sans-serif kullanılacaktır).
* **UI ve Etiketler (`font-ui`):** `system-ui, sans-serif` (HUD etiketleri, bilişsel yükü azaltan minimalist yönlendirmeler).

## 3. Bileşen Yapıları (Components)

### 3.1. Taş Bileşeni (Tile Component)
Oyunun kalbi olan taşlar, 3 boyutlu derinlik hissini CSS pseudo-elementleri ile verir. Aritmetik ifadeler için optimize edilmelidir.
* **Temel Sınıf:** `bg-ivory-50 border-2 border-ivory-400 rounded-lg shadow-tile relative`
* **3D Derinlik (`::after`):** Taşın altına yerleşecek şekilde `left: 6px; top: 6px; background: ivory-300; z-index: -1`.
* **Durumlar:**
    * `hover`: `translate-y-[-3px]` ve genişlemiş gölge.
    * `selected`: `bg-[#fffbe8] shadow-gold-300` ve sekme (bounce) animasyonu.
    * `matched`: Küçülerek kaybolma animasyonu (`scale-0 opacity-0`).
    * `locked`: `opacity-50 grayscale` ve tıklanamaz (cursor-not-allowed).

### 3.2. Butonlar (Buttons)
* `btn-primary`: Jade gradient arkaplan (`from-jade-400 to-jade-600`), beyaz metin, border `jade-300`.
* `btn-gold`: Altın gradient, koyu kahverengi metin (Ödül veya sonraki seviye için).
* `btn-ghost`: Transparan arkaplan, `ivory-300` metin, border `jade-500` (İkincil eylemler, ipucu).

### 3.3. HUD (Heads Up Display)
* Üst kısma sabitlenmiş (sticky top).
* Glassmorphism efekti: `bg-bg-surface/90 backdrop-blur-md border-b border-jade-700/30`.
* İçerik: Süre (Timer), Skor, Seviye Adı ve Duraklat/İpucu butonları.

## 4. Efektler ve Z-Index Skalası

* `z-board: 10` (Arkaplan ve oyun alanı)
* `z-tile: 20` (Taşlar)
* `z-ui: 100` (HUD ve Butonlar)
* `z-overlay: 200` (Modal arkası karartma)
* `z-modal: 300` (Oyun sonu, duraklatma ekranları)
* `z-toast: 400` (Kombo ve başarı popup'ları)

**Gölge (Shadow) Tokenları:**
* `shadow-tile`: `4px 6px 12px rgba(0,0,0,0.45)`
* `shadow-modal`: `0 8px 48px rgba(0,0,0,0.6)`

## 5. Animasyonlar (Keyframes)
Tailwind `tailwind.config.ts` içerisine eklenecek özel animasyonlar:
* `tile-select`: Taş seçildiğinde yukarı zıplama efekti.
* `score-float`: Doğru eşleşmede puanın (örn: +20) taşın üzerinden yukarı doğru süzülerek kaybolması.
* `modal-up`: Modalların aşağıdan yukarı doğru yumuşak (spring) bir geçişle açılması.
