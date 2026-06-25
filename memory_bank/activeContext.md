# Active Context — ProjeHaritası

*Son güncelleme: 2026-06-25*

## Şu Anki Odak

Memory Bank sistemi kurulumu ve AI kılavuzlarının ProjeHaritası'na uyarlanması.

## Son Tamamlanan Değişiklikler

| Tarih | Değişiklik |
|---|---|
| 2026-06-25 | `memory_bank/` klasörü oluşturuldu, AI_GUIDELINES.md ProjeHaritası'na uyarlandı |
| 2026-06-25 | ROADMAP.md: özellik yol haritası kolaydan zora sıralı eklendi |
| 2026-06-25 | `start.sh`'e seed_risks, seed_punchlist, seed_iolist eklendi |
| 2026-06-25 | **I/O Listesi** modülü eklendi (`apps/iolist`) — DI/DO/AI/AO, PLC adres, kablo takibi |
| 2026-06-25 | **Punch List** modülü eklendi (`apps/punchlist`) — FAT/SAT, öncelik A/B/C, kapatma formu |
| 2026-06-25 | **Risk Kayıt Defteri + Isı Haritası** eklendi (`apps/risks`) — olasılık×etki, bubble chart |

## Sonraki Adımlar (ROADMAP'ten)

**Kolay (1-3 gün) — sıradaki hedefler:**
- [ ] Milestone Takibi — kritik tarihler, gecikme rengi, Gantt özeti
- [ ] Saha Değişiklik Emri (FCO)
- [ ] iCal Export (FAT/SAT/milestone → .ics)
- [ ] Proje Şablonları
- [ ] Kablo Listesi Modülü

## Aktif Kararlar

- Memory Bank dosyaları `memory_bank/` klasöründe tutulur (proje kökünde)
- AI_GUIDELINES.md Aeon Engine'den adapte edildi, Rust kuralları kaldırıldı
- `.mcp.json` ve `memory_bank/` klasörü henüz `.gitignore`'da değil (commit edilecek mi?)

## Önemli Öğrenmeler

- `start.sh` her seed komutunu sırayla çalıştırır — yeni seed eklendiğinde burası güncellenmeli
- Sidebar sekmesi eklendiğinde `index.html`'deki nav ve `app.js`'deki `switchTab` her ikisi de güncellenmeli
