# **MVP Kapsam Dokümanı (Minimum Viable Product)**

**Proje Adı:** Aritmetik Mahjong

**Versiyon:** MVP v1.0

**Hedef Sürüm Süresi:** 2-3 Hafta (Tek Sprint)

**Rol:** Teknik Product Owner

## **1\. MVP Hedefi ve Temel Hipotez**

**Neyi Test Ediyoruz?** Kullanıcıların geleneksel görsel Mahjong eşleştirmesi yerine "matematiksel sonuç eşleştirmesi" (Örn: 12 \+ 4 taşı ile 8 \* 2 taşını eşleştirmek) mekaniğini eğlenceli ve akıcı bulup bulmadığını test ediyoruz.

**Başarı Kriteri:** Oyuncuların ortalama 3 seviye tamamlaması ve "Deadlock" (hamle kalmama) durumunda oyunu terk etmek yerine "Yeniden Oyna" (Restart) butonuna basması.

## **2\. Kapsama Dahil Edilenler (In-Scope \- Yapılacaklar)**

MVP aşamasında sadece çekirdek oyun döngüsünü (Core Game Loop) inşa edeceğiz:

### **2.1. Temel Oyun Mekaniği**

* **3D Grid Sistemi:** Taşların üst üste binebilmesi ve "sadece üstü ve en az bir yanı boş olan taşların seçilebilmesi" kuralı **tamamen uygulanacaktır**. (Oyunun Mahjong olabilmesi için bu zorunludur).  
* **Basitleştirilmiş Bölüm Tasarımı (Layout):** Dinamik layout üretimi yerine, sisteme hardcoded (elle girilmiş) 3 farklı dizilim (Kolay, Orta, Zor piramit) eklenecektir.

### **2.2. Basit İfade Üretici (Lite Expression Engine)**

* TPRD'deki 999 sınırını ve karmaşık bölme algoritmalarını erteliyoruz.  
* **MVP Sınırı:** İşlemlerin sonuçları **maksimum 99** olacaktır.  
* **Operatörler:** Sadece Toplama (+), Çıkarma (-) ve çok basit Çarpma (\* \- max 10'lar çarpım tablosu) kullanılacaktır. Bölme işlemi MVP'de yoktur.

### **2.3. Durum Yönetimi (State)**

* Puanlama, seviye geçişi ve kalan süre gibi bilgiler Zustand ile sadece istemcide (client-side) tutulacaktır.  
* Sayfa yenilendiğinde oyun **sıfırlanacaktır** (Kalıcı veri yok).

## **3\. Kapsam Dışı Bırakılanlar (Out-of-Scope \- V2.0'a Ertelenenler)**

Hızlı canlıya çıkabilmek için TPRD'de yer alan şu büyük özellikler **MVP'de KESİNLİKLE YAPILMAYACAKTIR**:

1. **Backend ve Veritabanı:** Supabase, PostgreSQL ve Edge Functions yok. Her şey tarayıcıda çalışacak.  
2. **Kullanıcı Girişi (Auth):** Üyelik sistemi, Google/Apple ile giriş yok. Herkes anonim oyuncu.  
3. **Offline-First ve PWA:** Dexie.js, IndexedDB, Service Worker entegrasyonu yok. Kullanıcının interneti varsa site açılır, yoksa açılmaz.  
4. **Anti-Cheat (Hile Koruması):** İstemci tarafında hile yapılabilir, şu anki önceliğimiz güvenlik değil, mekanik testidir.  
5. **Gelişmiş Puan Algoritması:** "Peş peşe eşleştirme bonusu" (Streak) veya "Zaman cezası" yok. Sadece her doğru eşleşme \+10 puan, yanlış eşleşme \-5 puan.  
6. **Otomatik Karıştırma (Auto-Shuffle):** Hamle kalmadığında (Deadlock) algılama yapılacak ancak taşlar karıştırılmayacak; kullanıcıya "Hamle Kalmadı, Oyunu Kaybettin \- Tekrar Dene" ekranı gösterilecek.

## **4\. MVP Teknoloji Yığını (Tech Stack)**

Sadeleştirilmiş teknoloji yığınımız:

* **Frontend:** Next.js (App Router) \+ TypeScript  
* **Stil:** Tailwind CSS  
* **State Management:** Zustand  
* **Deployment:** Vercel (Sıfır config, anında canlıya alma)

## **5\. MVP Kabul Kriterleri (DoD \- Definition of Done)**

Geliştirme ekibi şu 4 maddeyi sağladığında MVP canlıya (Production) alınır:

1. Kullanıcı vercel.app linkine girdiğinde "Oyuna Başla" butonunu görür.  
2. Ekrana, kurallara uygun olarak tıklanabilir ve tıklanamaz taşlar (matematik ifadeleri içeren) dizilir.  
3. İki taşı seçtiğinde, matematiksel sonuçları aynıysa (Örn: 10+5 ve 3\*5) taşlar sahneden kaybolur, değilse titreşim efektiyle hata verip seçimi iptal eder.  
4. Sahnedeki tüm taşlar bittiğinde "Kazandın", eşleşecek taş kalmadığında "Kaybettin" modalı çıkar.

*Not: Bu doküman, sadece piyasa testi (Proof of Concept) içindir. Başarılı olursa, kod tabanı TPRD v2.0 standartlarına göre refactor edilecektir.*