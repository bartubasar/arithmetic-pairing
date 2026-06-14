# **Teknik Ürün Gereksinim Dokümanı (TPRD)**

**Proje Adı:** Aritmetik Mahjong

**Versiyon:** 2.0 (Geliştirmeye Hazır \- Ready for Dev)

**Tarih:** 16 Nisan 2026

**Rol:** Teknik Product Owner

## **1\. Proje Özeti ve Kapsam**

Bu doküman, BPO (Business Product Owner) tarafından belirlenen iş kurallarının ve oyun mekaniklerinin, geliştirme ekibi tarafından uygulanabilir teknik gereksinimlere dönüştürülmüş halidir. "Aritmetik Mahjong", matematiksel ifade eşleştirmeye dayalı, zorluk seviyesi dinamik olarak artan, çevrimdışı (offline-first) yeteneklere sahip bir PWA (Progressive Web App) projesidir.

## **2\. Teknoloji Yığını (Tech Stack) Mimarisi**

* **Frontend Framework:** Next.js (App Router) \+ TypeScript  
* **Stil ve Animasyon:** Tailwind CSS \+ Framer Motion (GPU hızlandırmalı, 60 FPS hedefli)  
* **Durum Yönetimi (State):** \* *Local Game State:* Zustand  
  * *Server State & Caching:* TanStack Query  
* **Yerel Veritabanı (Offline-First):** Dexie.js (IndexedDB wrapper)  
* **Backend, Auth & Veritabanı:** Supabase (PostgreSQL, Edge Functions, OAuth 2.0)  
* **Matematik Motoru:** Math.js (Yalnızca formül doğrulama ve hesaplama için)

## **3\. Veritabanı Şeması ve Güvenlik (Supabase)**

Oyun mantığı istemcide çalışsa da, doğrulama otoritesi her zaman sunucu (Supabase Edge Functions) olacaktır. İstemci veritabanına doğrudan yazma yetkisine sahip değildir.

### **3.1. Tablo Yapıları**

**Tablo: users** (RLS: Sadece kendisi okur/yazar)

* id (UUID, Primary Key)  
* email (String, Nullable)  
* display\_name (String)  
* current\_score (Integer, Default: 1000\)  
* max\_level\_reached (Integer, Default: 1\)  
* created\_at (Timestamp)  
* last\_sync\_at (Timestamp)

**Tablo: game\_sessions** (RLS: Sadece yetkili uç noktalar yazar)

* session\_id (UUID, Primary Key)  
* user\_id (UUID, Foreign Key)  
* level\_id (Integer)  
* status (Enum: 'completed', 'failed', 'abandoned')  
* math\_difficulty\_multiplier (Decimal)  
* layout\_complexity\_multiplier (Decimal)  
* duration\_seconds (Integer)  
* errors\_made (Integer)  
* final\_score\_delta (Integer) \- Oturumdaki puan değişimi  
* completed\_at (Timestamp)

### **3.2. Güvenlik Kuralları (Anti-Cheat)**

* **Otoritatif Sunucu:** İstemci, oyun sonu puanını iletmez; oynanan "hamleleri" iletir. Backend bu hamleleri tekrar hesaplayarak nihai puanı belirler.  
* **Rate Limiting:** Hamleler arası süre kontrol edilir (örn: \< 200ms ise 429 Too Many Requests hatası döner).

## **4\. Çekirdek Algoritmalar**

### **4.1. Aritmetik İfade Üretim Motoru (Expression Engine)**

Hedeflenen sonucu verecek sayıları rastgele üretmek yerine, belirlenen hedef sayıdan geriye doğru giden bir "Reverse Calculation" mantığı uygulanacaktır.

* **Sınırlandırma:** Sayılar ve sonuçlar **maksimum 999** olabilir.  
* **Akış:**  
  1. Hedef sonuç (![][image1]) belirlenir (Örn: 42).  
  2. difficulty\_tier seviyesine göre operatör havuzu seçilir (+, \-, \*, /).  
  3. Seçilen operatöre göre iki sayı üretilir (Örn: Çarpma seçildiyse, 42'nin çarpanları bulunur; 6 \* 7 gibi).  
  4. Bölme işlemi (/) seçildiğinde, **daima tam bölünen** sayılar (modulo \== 0\) kullanılmak zorundadır (Örn: ![][image2] için ![][image3] üretilebilir, ![][image4] üretilemez).

### **4.2. Mahjong Layout Koordinat Sistemi (3D Grid)**

Taşların tıklanabilirlik (isPlayable) durumu 3 boyutlu (![][image5]) bir matris üzerinden hesaplanacaktır.

* **Veri Yapısı:** Grid\[x\]\[y\]\[z\] \= tile\_id (Boşluklar null)  
* **Kural:** Bir taşın tıklanabilir olması için:  
  1. Üzerinde (Z+1 seviyesinde) başka bir taş bulunmamalıdır.  
  2. Sağ (X+1) ve sol (X-1) yüzeylerinden **en az biri** boş olmalıdır.

## **5\. Frontend State Management (Zustand)**

Oyun içi performansın yüksek tutulması için Zustand kullanılacak ve aşağıdaki arayüzler (interfaces) baz alınacaktır:

interface Tile {  
  id: string;  
  expression: string; // Örn: "12 \+ 4"  
  value: number; // Örn: 16 (gizli değer)  
  position: { x: number; y: number; z: number };  
  isPlayable: boolean;   
  state: 'idle' | 'selected' | 'matched';  
}

interface GameState {  
  tiles: Record\<string, Tile\>;  
  selectedTiles: string\[\]; // Maksimum 2 eleman  
  currentScore: number;  
  errorsInRow: number;  
    
  selectTile: (tileId: string) \=\> void;  
  evaluateMatch: () \=\> void;  
  applyScoreLogic: () \=\> void;  
}

## **6\. API ve Senkronizasyon Tasarımı (Offline-First)**

### **6.1. Edge Function: /v1/sync-session**

Oyun oturumu tamamlandığında (veya iptal edildiğinde) çağrılır.

* **Yük (Payload):**  
  {  
    "session\_id": "uuid",  
    "level\_id": 12,  
    "moves\_log": \[  
      {"action": "match", "time\_ms": 1200},  
      {"action": "error", "time\_ms": 3500}  
    \]  
  }

* **İşlem:** Sunucu bu logu okur, hata ve başarıları iş biriminin belirlediği formülle hesaplar, veritabanına son durumu yazar.

### **6.2. Dexie.js ile Offline Çalışma**

* Cihaz internete bağlı değilken tamamlanan oyunlar IndexedDB'deki pending\_sync\_sessions tablosunda tutulur.  
* Service Worker, bağlantı geldiğinde ( navigator.onLine \=== true ) bu tabloyu okur ve arka planda sırayla Supabase'e eşitler. Eşitleme başarılı olursa yerel kayıt silinir (Local Wins stratejisi).

## **7\. Edge Case'ler (İstisnai Durumlar)**

1. **Sekmenin Kapatılması/Terk Edilmesi:**  
   * visibilitychange veya beforeunload eventlerinde Navigator.sendBeacon() ile sunucuya status: "abandoned" isteği atılır. Seriler (streak) sıfırlanır, ceza puanı kesilmez.  
2. **Olası Hamle Kalmaması (Deadlock):**  
   * Her hamleden sonra isPlayable \=== true olan taşlar taranır. Eşleşebilecek değer kalmamışsa, taşlar otomatik karıştırılır (Shuffle) ve kullanıcıya "Hamle kalmadı, taşlar karıştırıldı" bildirimi verilir. Puan kesintisi uygulanmaz.

## **8\. Kalite Güvence ve Kabul Kriterleri (Definition of Done)**

Bir sprint görevinin tamamlanmış sayılması için aşağıdaki şartlar sağlanmalıdır:

* **Performans:** Lighthouse PWA skoru (Desktop & Mobile) \> 90 olmalıdır. İlk yükleme (FCP) 1.5 saniyenin altında olmalıdır.  
* **Görsellik:** Taş eşleşme animasyonları düşük donanımlı cihazlarda bile 60 FPS (Frame drop olmadan) çalışmalıdır (CSS Transform ve Opacity kullanılmalıdır).  
* **Birim Testleri (Unit Tests):**  
  * Bölme işlemi algoritmasının küsuratlı sayı üretmediği Jest ile doğrulanmalıdır.  
  * 3D Grid matrisindeki tıklanabilirlik kuralı (%90 Coverage) test edilmelidir.  
* **Uçtan Uca Test (E2E):** Cypress veya Playwright ile "İnternet kesilmesi \-\> Hamle yapılması \-\> İnternetin geri gelmesi \-\> Puan eşitlemesi" senaryosu başarıyla geçilmelidir.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAABF0lEQVR4XmNgGAUMCgoKBvLy8rNAGMheKScn9wgdA+VK0PWBAVBiEhD/B+JfQLwIqDgEhoH8uSA5RUVFM3R9II2WQHwBaKMCsjhIMVD8PRD/BeJgZDk4AJpeDtTXgCwG1CgPFLsFshEoXwYUYkSWhwOgZDtQkSayGJB/haBGbEBJSYkf6v9ZxsbGrOjyWAFIIdCm6SCNMjIyQujy+AAjyIkgjSC/IkuAvAQ0TBVZDAWAQhMaqu/RooRFHhJ1NkhiCACUDJKHxO97oCIXZDlZWVkdoNhBKSkpEWRxOABpgtqKHpeMQLFmIJ6EJs7AIC0tLQOUOA1yFjCE5YC0JBJeJA8J8QdA/0qj60VOkvjwFAZS4nkUDBsAANetVa2cvNekAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAZCAYAAABzVH1EAAACDklEQVR4Xu2WvUsjURTFJ7jCioKghmi+Jh9YWAhCQFAsLLTSIKidjZWFnbC4rd32KSwEm3SChZUgiOh/YGEliijCVhIEbQIh/q6+iW+uGtfCCQtz4PDyzn0f9+TdeTOOEyJEiC8hk8mMuK67RbtDe5lOp2800X/ped+MSCqVitO22WIsFuu0+z6QZAnWYRkukfiikN/bRq9ks9lRPe87EY1Gu9j3GD7In2xyOYNVPfYZBMbgKaeRsXVJHL0GF2w9KBgj+8ZEiT+22PQ0GPAbDxu2hgkX7ZzYOt2IHQsKYoT992BBx97DDwb+wfGQJ4gJc4R1p0UmBF814kMul+vGwKGYkCPV8SDhGTElvinlBccd9fC/QaFQaDcGjpLJZI+ON4OMpxTnvEviM7LHTNN6dxpGDlzrGWWP5c8qJcKkdXkupLQ8kUlDJDloD2wlpMzI6RFmdewZ4hrW9BWLVmbyhK21EuSSI6e/tFM6JsnOwyqs6BgTTuLxeJ/WA0CE6lgjpztyWPFE+gPwGq1ojW28KypyGnIqviCLoZWU9i4ov2GzTv0feZXP51N6HQ/Wy7BO0nue7pWWr0oSiUTSLFrmtkq7L26F46JJjAQTjQkBg2SnxQwn0y99cumgvwtrvoHu62fJh3Sa3A4BQCpiFd66L58nF/Aeg7N64H8BKqcXA0uczCT8qeMhQoQIESJwPAFisZ4/ywmtxQAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAXCAYAAACI2VaYAAACo0lEQVR4Xu2WTaiMURjH38lVV4lyjY/5OvO1oSRNlGIjysLHDYubKxuLa2Fvezd3IVmxcYticymRUMpmdgqRrSg2ZIHVlUmM3zPznOt45n3fGUVzk389ve/7P//znP/5emai6D8WOcrl8mg2m11u+UWBUql0GoNTlv9dZAqFQp3nEttQqVTWSnvIVavVlfV6fUXIWYjGOXeH2GCaMvl8fqxWq62JYsYLkWF2G5ndbZK8JtZbAdwb4j2a6zxnVfeR2GK1Ici7A81VXkc8J0aJp8RjzfuZOBVZk6zUJhq+qaCt4iRz0u7jZbFY3Gp1Bhl055nQhCdYrQLcM7hx/R7j/ZHk5HnyZ9cAzLCBYD7FXDOOTwPmD9DnchQcB8bZDfedaBHbhcPUFZ1w0+t+wd8wJ4MSew2d4fxu1rMtO7eMse+ruXNG28Ug5tBUeR4lZuWMRuaCWKB7oBcpEazuTnQtJvECrbPtHfQzJ50laDshScAXvqcbjcZSq/VAM2M5D1ZsFe2HJQ9xk1zrrGYB/czBPcHUNv9NsjNwbfodC3Uesl1Oz1QcxBw5DuqWPid2RUk70c+chZaIr8QH11vDxPy05ZJA/0MyUaJl2zpIMydbB/cWzZ4Y/by8h3otvHdDzkNyo9+Xy+VWey7I1Q61C0gzJ9/S0QW3Cf1+5d7JRQn1pW65uBVyAqlprruF0u8eqzsqvNRLp3XW9ukgzZyuxJwUUM+ReEoHmYuC6h91C+8FYjLgOpCbC//KmnNJ2ypGtMFGM/wnoRdAEl8qd4tm7C8EbRPOFN4QMlEW4hqaT2gv8nyo452VS2T1A4Mf6SKJj5BoMqGEjIjxcm/h7YHkQjcux0O227b/ccjZcwMU3qFAz2Fi4R0qMHbDpRTeoYJtPW65fxI/AAdI1sFr79LxAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAXCAYAAACI2VaYAAACa0lEQVR4Xu2WvWtUQRTF38MUEQTFuBr3a/bDRkWCiIKgjSgo+BG0CQRsY2FtWkVSSdJoYyNoZSGJYhTBwu0EBcVWENR/wMaIW+j6u7t34uSafW+EwAbxwGXnnXvmznkzb26SJP+xzlGr1YYLhcImy68LVKvVaQxOWf5vkZbL5V38brAJC+fcJHHK8haNRmMzusfEbpNKS6XSSLPZ3J7krJfydnt4u0cU+UjstAILNEuyI5a3QHME7T2GQ54To8Qb4jXxifhGXE6sSXZqH4kfKuioONOc7kYnwlyK7iYvPeEJdqsM9xZuXJ9HGL+Sevxe+j01AAsdQLCUZ65erx8i/zTGXKVSOYvuDsPUc8w5DveTaBOHhcPUXalHtLxuBWLMyY6he8iiR2PMyaLESUOnvOCYfttychup80zNzRptDxHm5Lu8wmLXZBxjDs1zjOywfAh90TZ136N1Nt9Fnjm4/cQLvV3yHGNuxnIe7NhW8heI78Q85katZhkR5hbRnAieM83JcTn9plaDmMPQOT3Sd8SxJPg2VyDLHLm9fsc88syx8FXL9QO1zks9om1zXeSYmyY+h6HFvup4LtRrq1kMOQ+pzZzTxWJxm+eCtTuhdhlZ5uTvonAmxNx1GbNLW0J9tdcuFkJOID3N9Y5Q5j5h3rDwXIqDTvusndNFlrnVIIX6HKvc5FvEpE3IzYX/YM25fscqRjRho2X/k9AdbFmt9DOvYTzhTOMNob3yPpovaG/z+1Lr3JBLZPVriaE+jfcPcMEq6MYxekaO2+bXHCzUcBGNdyBgJ6ZcRuMdKDD2wGU03oGCY71ouX8SvwDJys3Vplxr0wAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAZCAYAAABuKkPfAAADKUlEQVR4Xu1XTWgTQRTekAqKolQMsfmbbJKDBbVCQFC8CApW8YciWPAiCCIoHgQVxYMevAmCCBapwZ56sIceLIp4Ug+FguC14EVEj6VChSpN/b7uWxhfNprNrpDDfvAxmffefDvz5s3sxnESJEiQoA3y+XzBGNMAnyiepx/tNfCpby+XyxNoR7ROEEql0pjWhe2KHeO67hBs05Z/DLbddkynwNxGRWMa/BxExKzX45xCobAVjpMIuACBVXCZC4d9F/34vR/+1+K7h9+ncrncNq0TBGgeR/xFjPvK8fh9ztf1QS34boFNcBE8ls1mN9oxnaBSqWzB2FnwBxPJhKA9TRpvEzn/FT2uBQj6IsGP0E1xMrLz9+v1+jod3ykwkQPQ+AVe1j4mhkkGt2tfGOAZN6ij7XjmAtcE/3V0U9rfAi5eksBkuEZKNEoCCH+XMJFXqIQNtg/2jyh/Y9vCgiUOnefgQduO/mCoBBAYsM94x4GJuBpHAnxwp6C3hLbu27D4vaQd1w2q1WoR2uNMtm9jYpGceTzvcag1cJe4W5KEpi0aFcVicSd1MbE77KPdg/4HFRYL5LKf4/NCJUCQYulIElbZ1wFR4CcXXAxVoiEA7ZfynDddbSJ25wwGv8MEn4mQq2OiAHrfRPc2umntjwruOvWxjrf2RcujAQzasW1h5JKS0uWt2nKbRwH0lkj7XogLkgB+x8yrizYFewP2UcsWDASOWIP70J8EZ7sqqTaQKphDEvq1LyLSWORN6uNeq9kO473l3rO17S3ApA4ZdUlB9AhsTba2PQK4I0zCQ+2ICPseW9BOSc4UfvZp31r5IOAuAn6CDX2Llr13L4WXJREtZxi+cYnhOfxbuaURcxT8HuYooDKHRL9tRcK3YrzL9hI44FM2kZfk2jePHseBwyJuc+Yffr4t/gAWdNh4n7pNfgcE+PuNvKoCOKzjNTKZzCZqg5/AAe1HYkoBupqTTlAVxA086GxQEuKAJHLKBCShl8Az+YD3inbEAb6pUNoTPJ7a1xOQ/wQzmOgJ7YsL0H/BY6HtPQP5l7nD+Q9ffj5qtdpmbUuQIEGCuPEbnNILNkxxtrEAAAAASUVORK5CYII=>