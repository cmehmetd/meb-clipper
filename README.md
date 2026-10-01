# Sayfayı Markdown İndir

Tarayıcıda açık olan web sayfasını **yalnızca cihazınızda** Markdown'a dönüştüren, düzenlemenize izin veren ve `.md` dosyası olarak indiren bir Chrome eklentisi.

## Özellikler

- **Manifest V3 uyumlu:** Güncel Chrome eklenti mimarisini kullanır.
- **Privacy-first:** Sayfa içeriği herhangi bir sunucuya veya üçüncü taraf servise gönderilmez.
- **Popup içinde tüm akış:** Dönüştürme, düzenleme ve indirme işlemleri eklentinin popup penceresinde yapılır.
- **Düzenlenebilir çıktı:** İndirmeden önce üretilen Markdown metnini ve dosya adını değiştirebilirsiniz.
- **Görsel tercihi:** İsterseniz görsellerin Markdown bağlantılarını çıktıya dahil edebilirsiniz.
- **Yaygın içerik desteği:** Başlıklar, paragraflar, bağlantılar, görseller, listeler, kod blokları, alıntılar ve yatay çizgiler Markdown'a çevrilir.

## Kurulum (geliştirici modu)

1. Bu depoyu bilgisayarınıza indirin veya klonlayın.
2. Chrome'da `chrome://extensions` adresini açın.
3. Sağ üstteki **Geliştirici modu** anahtarını açın.
4. **Paketlenmemiş öğe yükle** düğmesine tıklayın.
5. Bu deponun kök klasörünü (`manifest.json` dosyasını içeren klasör) seçin.
6. Araç çubuğundaki eklenti simgesinden **Sayfayı Markdown İndir** eklentisini sabitleyin.

## Kullanım

1. Markdown olarak kaydetmek istediğiniz web sayfasını açın.
2. Tarayıcı araç çubuğundaki eklenti simgesine tıklayın.
3. Gerekirse **Görsel bağlantılarını ekle** seçeneğini ayarlayın.
4. **Sayfayı dönüştür** düğmesine basın.
5. Markdown metnini popup içindeki düzenleyicide gözden geçirin ve düzenleyin.
6. Dosya adını belirleyip **Markdown indir** düğmesine tıklayın.
7. Chrome'un indirme penceresinde kayıt konumunu seçin.

## Gizlilik ve izinler

Eklenti, dönüşüm için yalnızca açık sekmeye kullanıcı eylemi sonrasında erişir. İzinlerin amacı şöyledir:

| İzin | Neden gerekli? |
| --- | --- |
| `activeTab` | Popup'tan komut verdiğiniz açık sekmeye geçici erişim sağlar. |
| `scripting` | Açık sayfanın içeriğini yerel olarak okumak ve Markdown'a dönüştürmek için kullanılır. |
| `downloads` | Düzenlediğiniz Markdown metnini `.md` dosyası olarak kaydetmek için kullanılır. |

Eklentide analiz, reklam, uzaktan API isteği veya içerik senkronizasyonu bulunmaz. Dönüştürme işlemi popup ile açık sekme arasında, tarayıcınızda gerçekleşir.

## Sınırlamalar

- Chrome'un korumalı sayfalarına (örneğin `chrome://` sayfaları ve Chrome Web Store) içerik betiği enjekte edilemez.
- JavaScript ile sonradan yüklenen içerik için sayfanın tamamen yüklenmesini bekleyip dönüşümü başlatın.
- Karmaşık tablo düzenleri düz metin olarak dışa aktarılır; indirmeden önce popup içinde düzenlenebilir.

## Geliştirme kontrolleri

```bash
node --check popup.js
python3 -m json.tool manifest.json >/dev/null
git diff --check
```
