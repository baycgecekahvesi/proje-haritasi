const Specs = (() => {
  const TYPES = {
    plc_scada: { label: "PLC/SCADA",        color: "#4f6ef7" },
    robot:     { label: "Robot Sistemleri",  color: "#e74c3c" },
    mes:       { label: "MES",               color: "#27ae60" },
    vizyon:    { label: "Vizyon Sistemi",    color: "#9b59b6" },
    elektrik:  { label: "Elektrik Altyapı", color: "#f39c12" },
    servo:     { label: "Servo/Hareket",     color: "#1abc9c" },
    genel:     { label: "Genel",             color: "#95a5a6" },
  };
  const STATUS_COLOR = {
    taslak: "#95a5a6", inceleme: "#f39c12", "onaylı": "#27ae60", revize: "#e74c3c",
  };

  // Bölüm tanımları (label + placeholder)
  const SECTIONS = [
    {
      key: "scope", label: "1. Kapsam",
      ph: "Sistemin genel kapsamını tanımlayın.\nÖrn: Bu şartname, XYZ fabrikasında kurulacak kaynak robotu entegrasyon sisteminin teknik gereksinimlerini kapsar.",
    },
    {
      key: "standards", label: "2. Geçerli Standartlar",
      ph: "Uygulanacak standartları listeleyin.\nÖrn:\n- IEC 61131-3 (PLC Programlama)\n- ISA-88 (Batch Kontrol)\n- ISA-95 (MES/ERP Entegrasyonu)\n- ISO 10218 (Robot Güvenliği)\n- IEC 62061 / ISO 13849 (Fonksiyonel Güvenlik)\n- ATEX Direktifi (varsa patlayıcı ortam)",
    },
    {
      key: "system_requirements", label: "3. Sistem Gereksinimleri",
      ph: "Proses tanımı ve çalışma koşulları:\n- Ortam: Sıcaklık, nem, IP koruma sınıfı\n- Kapasite/Performans: Cycle time, OEE hedefi, veri saklama\n- Güvenlik: SIL seviyesi, güvenlik kilitlemeleri, e-stop\n- Erişilebilirlik: %99.5 uptime, MTBF/MTTR hedefleri",
    },
    {
      key: "hardware_specs", label: "4. Donanım Spesifikasyonları",
      ph: "PLC/DCS:\n- Marka/Model:\n- CPU kapasitesi:\n- I/O sayısı (DI/DO/AI/AO):\n- Redundancy:\n\nSCADA/HMI:\n- Ekran sayısı ve çözünürlük:\n- Tag sayısı:\n- Lisans tipi:\n\nRobot (varsa):\n- Eksen sayısı:\n- Taşıma kapasitesi (kg):\n- Ulaşım mesafesi (mm):\n- End-effector tipi:\n\nServo/İnverter (varsa):\n- Güç (kW):\n- Haberleşme protokolü:\n\nElektrik Pano:\n- IP sınıfı:\n- Bara kapasitesi:\n- UPS gereksinimi:",
    },
    {
      key: "software_specs", label: "5. Yazılım / MES Gereksinimleri",
      ph: "MES Modülleri:\n- Üretim emirleri yönetimi (Production Order Management)\n- Üretim takibi ve izlenebilirlik (Traceability, Batch/Serial)\n- OEE hesaplama ve raporlama\n- Kalite yönetimi (SPC, hata kayıt, NCR)\n- Vardiya yönetimi\n\nERP Entegrasyonu:\n- Sistem: (SAP / Oracle / diğer)\n- Protokol: (REST API / OPC-UA / SOAP)\n\nGüvenlik:\n- Kullanıcı yetkilendirme seviyeleri\n- Audit trail gereksinimleri\n- 21 CFR Part 11 (varsa)",
    },
    {
      key: "communication", label: "6. Haberleşme ve Ağ",
      ph: "Haberleşme Protokolleri:\n- OPC-UA\n- Modbus TCP/RTU\n- Profinet / Profibus\n- Ethernet/IP\n- MQTT\n\nAğ Topolojisi:\n- OT/IT ağ segmentasyonu\n- Switch/router gereksinimleri\n- Siber güvenlik gereksinimleri (Firewall, VPN)\n- Uzaktan erişim altyapısı",
    },
    {
      key: "acceptance_tests", label: "7. Kabul Testleri",
      ph: "FAT (Fabrika Kabul Testi):\n- Test ortamı ve koşulları\n- Fonksiyonel test senaryoları\n- Performans doğrulama kriterleri\n- Katılımcılar ve protokol\n\nSAT (Saha Kabul Testi):\n- Saha test prosedürü\n- Availability ve response time hedefleri\n- Üretim doğrulama süresi\n- Hata/düzeltme süreci",
    },
    {
      key: "documentation_req", label: "8. Dokümantasyon Gereksinimleri",
      ph: "Teslim edilecek belgeler:\n- Elektrik şemaları (EPLAN / AutoCAD E3)\n- PLC/SCADA kaynak kodları (yorumlu)\n- Proses akış diyagramları (P&ID)\n- Kullanım kılavuzu (operatör)\n- Bakım kılavuzu (teknisyen)\n- Yedek parça listesi (BOM)\n- FAT/SAT protokol belgeleri\n- Risk değerlendirmesi (CE / TS EN ISO 12100)",
    },
    {
      key: "training_warranty", label: "9. Eğitim ve Garanti",
      ph: "Eğitim:\n- Operatör eğitimi: süre, içerik, katılımcı sayısı\n- Teknisyen eğitimi: PLC programlama, arıza giderme\n- Eğitim materyalleri\n\nGaranti:\n- Garanti süresi:\n- Kapsam (yedek parça, işçilik):\n- Müdahale süresi (SLA): 4 saat / 24 saat / next business day\n\nBakım Sözleşmesi:\n- Yıllık bakım planı\n- Uzaktan destek koşulları\n- Yedek parça stok yükümlülüğü",
    },
  ];

  let searchTimer;

  // ---------------------- Liste ----------------------
  async function load() {
    const search   = document.getElementById("sp-search").value.trim();
    const specType = document.getElementById("sp-type").value;
    const status   = document.getElementById("sp-status").value;
    const params   = new URLSearchParams();
    if (search)   params.set("search", search);
    if (specType) params.set("spec_type", specType);
    if (status)   params.set("status", status);

    const box = document.getElementById("specs-list");
    box.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    try {
      const items = await API.get(`/specs/?${params}`);
      renderCards(items, box);
    } catch (e) {
      box.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`;
    }
  }

  function renderCards(items, box) {
    if (!items.length) {
      box.innerHTML = `<p class="muted">Şartname bulunamadı.</p>`;
      return;
    }
    const editor = Auth.isEditor();
    box.innerHTML = `<div class="sp-grid">${items.map((s) => cardHtml(s, editor)).join("")}</div>`;
    box.querySelectorAll("[data-view-sp]").forEach((el) =>
      el.onclick = () => openDetail(+el.dataset.viewSp));
    if (editor) {
      box.querySelectorAll("[data-edit-sp]").forEach((el) =>
        el.onclick = () => openForm(items.find((s) => s.id === +el.dataset.editSp)));
      box.querySelectorAll("[data-del-sp]").forEach((el) =>
        el.onclick = async () => {
          if (!confirm("Şartname silinecek. Emin misiniz?")) return;
          await API.del(`/specs/${el.dataset.delSp}`);
          UI.toast("Şartname silindi", "success");
          load();
        });
    }
  }

  function cardHtml(s, editor) {
    const t = TYPES[s.spec_type] || TYPES.genel;
    const sc = STATUS_COLOR[s.status] || "#95a5a6";
    const filled = SECTIONS.filter((sec) => s[sec.key] && s[sec.key].trim()).length;
    return `
      <div class="sp-card">
        <div class="sp-card-head">
          <div>
            <span class="badge" style="background:${t.color}">${t.label}</span>
            <span class="badge" style="background:${sc};margin-left:4px">${UI.esc(s.status_display)}</span>
          </div>
          <span class="muted" style="font-size:11px">${UI.esc(s.revision)}</span>
        </div>
        <h4 class="sp-title">${UI.esc(s.title)}</h4>
        ${s.customer ? `<div class="muted sp-sub">🏭 ${UI.esc(s.customer)}</div>` : ""}
        ${s.contract_no ? `<div class="muted sp-sub">📄 ${UI.esc(s.contract_no)}</div>` : ""}
        <div class="sp-progress">
          <div class="sp-progress-bar" style="width:${Math.round(filled / SECTIONS.length * 100)}%"></div>
        </div>
        <div class="muted" style="font-size:11.5px;margin-top:4px">${filled}/${SECTIONS.length} bölüm dolduruldu</div>
        <div class="sp-card-actions">
          <button class="btn btn-sm" data-view-sp="${s.id}">👁 Görüntüle</button>
          ${editor ? `<button class="btn btn-sm" data-edit-sp="${s.id}">✏️ Düzenle</button>` : ""}
          ${editor ? `<button class="btn btn-sm btn-danger" data-del-sp="${s.id}">🗑</button>` : ""}
        </div>
      </div>`;
  }

  // ---------------------- Detay Modalı ----------------------
  async function openDetail(id) {
    const s = await API.get(`/specs/${id}`);
    const t = TYPES[s.spec_type] || TYPES.genel;
    const sc = STATUS_COLOR[s.status] || "#95a5a6";
    const sectionsHtml = SECTIONS.map((sec) => {
      const content = s[sec.key] ? s[sec.key].trim() : "";
      if (!content) return "";
      return `
        <div class="sp-detail-section">
          <h4>${UI.esc(sec.label)}</h4>
          <pre class="sp-detail-pre">${UI.esc(content)}</pre>
        </div>`;
    }).join("");

    UI.openModal(`
      <div class="sp-detail-head">
        <span class="badge" style="background:${t.color}">${t.label}</span>
        <span class="badge" style="background:${sc};margin-left:6px">${UI.esc(s.status_display)}</span>
        <span class="pill" style="margin-left:6px">${UI.esc(s.revision)}</span>
      </div>
      <h3 style="margin:10px 0 4px">${UI.esc(s.title)}</h3>
      <div class="muted" style="font-size:12.5px;margin-bottom:14px">
        ${s.customer ? `🏭 ${UI.esc(s.customer)}` : ""}
        ${s.contract_no ? ` &nbsp;·&nbsp; 📄 ${UI.esc(s.contract_no)}` : ""}
        &nbsp;·&nbsp; 👤 ${UI.esc(s.created_by_username || "—")}
        &nbsp;·&nbsp; 🕐 ${UI.fmtDate(s.updated_at)}
      </div>
      ${sectionsHtml || `<p class="muted">Henüz bölüm içeriği girilmemiş.</p>`}
      <div class="modal-actions">
        ${Auth.isEditor() ? `<button class="btn btn-primary" id="sp-edit-from-detail">✏️ Düzenle</button>` : ""}
      </div>
    `);
    if (Auth.isEditor())
      document.getElementById("sp-edit-from-detail").onclick = () => { UI.closeModal(); openForm(s); };
  }

  // ---------------------- Form (Yeni / Düzenle) ----------------------
  function openForm(spec = null) {
    const isEdit = !!spec;
    const v = (k, d = "") => spec ? (spec[k] ?? d) : d;

    const typeOpts = Object.entries(TYPES).map(([k, t]) =>
      `<option value="${k}" ${v("spec_type","genel") === k ? "selected" : ""}>${t.label}</option>`
    ).join("");
    const statusOpts = [
      ["taslak","Taslak"], ["inceleme","İncelemede"], ["onaylı","Onaylı"], ["revize","Revize"]
    ].map(([k, lbl]) =>
      `<option value="${k}" ${v("status","taslak") === k ? "selected" : ""}>${lbl}</option>`
    ).join("");

    const sectionsFormHtml = SECTIONS.map((sec) => `
      <div class="sp-form-section">
        <div class="sp-form-section-head" data-toggle-sec="${sec.key}">
          <span>${sec.label}</span>
          <span class="sp-toggle-icon">▼</span>
        </div>
        <div class="sp-form-section-body" id="sec-body-${sec.key}">
          <textarea name="${sec.key}" rows="7" placeholder="${UI.esc(sec.ph)}">${UI.esc(v(sec.key))}</textarea>
        </div>
      </div>`
    ).join("");

    UI.openModal(`
      <h3>${isEdit ? "Şartname Düzenle" : "Yeni Teknik Şartname"}</h3>
      <form id="sp-form">
        <div class="form-grid" style="margin-bottom:14px">
          <div class="form-row" style="grid-column:1/-1"><label>Şartname Başlığı *</label>
            <input name="title" required value="${UI.esc(v("title"))}" placeholder="Örn: Bursa Hattı Kaynak Robotu Teknik Şartnamesi" />
          </div>
          <div class="form-row"><label>Sistem Tipi</label><select name="spec_type">${typeOpts}</select></div>
          <div class="form-row"><label>Durum</label><select name="status">${statusOpts}</select></div>
          <div class="form-row"><label>Müşteri / Firma</label><input name="customer" value="${UI.esc(v("customer"))}" /></div>
          <div class="form-row"><label>Sözleşme / Teklif No</label><input name="contract_no" value="${UI.esc(v("contract_no"))}" /></div>
          <div class="form-row"><label>Revizyon</label><input name="revision" value="${UI.esc(v("revision","Rev.0"))}" /></div>
        </div>
        <div class="sp-sections-wrap">${sectionsFormHtml}</div>
        <div class="form-error" id="sp-error"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="sp-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Kaydet" : "Oluştur"}</button>
        </div>
      </form>
    `);

    // Accordion toggle
    document.querySelectorAll("[data-toggle-sec]").forEach((el) => {
      el.onclick = () => {
        const body = document.getElementById(`sec-body-${el.dataset.toggleSec}`);
        const icon = el.querySelector(".sp-toggle-icon");
        body.classList.toggle("collapsed");
        icon.textContent = body.classList.contains("collapsed") ? "▶" : "▼";
      };
    });

    document.getElementById("sp-cancel").onclick = () => UI.closeModal();
    document.getElementById("sp-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      try {
        if (isEdit) await API.put(`/specs/${spec.id}`, body);
        else        await API.post("/specs/", body);
        UI.toast(isEdit ? "Şartname güncellendi" : "Şartname oluşturuldu", "success");
        UI.closeModal();
        load();
      } catch (err) {
        document.getElementById("sp-error").textContent = err.message;
      }
    };
  }

  function bindEvents() {
    document.getElementById("sp-new-btn").onclick = () => openForm();
    document.getElementById("sp-type").onchange = load;
    document.getElementById("sp-status").onchange = load;
    document.getElementById("sp-search").addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(load, 300);
    });
  }

  return { load, bindEvents };
})();
