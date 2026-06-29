const Calculations = (() => {
  // ─── Hesaplama tanımları ───────────────────────────────────────────
  // Her hesaplama: label, category, fields (her field: key, label, type, unit, default, required)
  const CALC_DEFS = {
    // ── ELEKTRİK ──
    cable_section: {
      label: "Kablo Kesiti Seçimi",
      category: "electric",
      standard: "IEC 60364-5-52",
      fields: [
        { key: "current_a",             label: "Akım",                 type: "number", unit: "A",   default: 50,   required: true },
        { key: "length_m",              label: "Kablo Uzunluğu",       type: "number", unit: "m",   default: 100,  required: true },
        { key: "voltage_v",             label: "Gerilim",              type: "number", unit: "V",   default: 400  },
        { key: "max_voltage_drop_pct",  label: "Max. Voltaj Düşümü",  type: "number", unit: "%",   default: 3.0  },
        { key: "material",              label: "İletken Malzeme",      type: "select", options: ["copper","aluminum"], default: "copper" },
        { key: "system",                label: "Sistem",               type: "select", options: ["3phase","1phase"],   default: "3phase" },
        { key: "installation",          label: "Döşeme Tipi",          type: "select", options: ["conduit","tray","direct"], default: "conduit" },
      ],
      resultKeys: ["selected_section_mm2","actual_voltage_drop_pct","actual_voltage_drop_v","current_capacity_a","standard"],
      resultLabels: {"selected_section_mm2":"Seçilen Kesit (mm²)","actual_voltage_drop_pct":"Voltaj Düşümü (%)","actual_voltage_drop_v":"Voltaj Düşümü (V)","current_capacity_a":"Akım Kapasitesi (A)","standard":"Standart"},
    },
    motor_current: {
      label: "Motor Akımı Hesabı",
      category: "electric",
      standard: "TS EN 60947-4-1",
      fields: [
        { key: "power_kw",      label: "Motor Gücü",       type: "number", unit: "kW",  default: 22,   required: true },
        { key: "voltage_v",     label: "Gerilim",          type: "number", unit: "V",   default: 380  },
        { key: "efficiency",    label: "Verim (η)",        type: "number", unit: "",    default: 0.92 },
        { key: "power_factor",  label: "Güç Faktörü (cosφ)", type: "number", unit: "",  default: 0.85 },
        { key: "system",        label: "Sistem",           type: "select", options: ["3phase","1phase"], default: "3phase" },
      ],
      resultKeys: ["full_load_current_a","starting_current_a","recommended_fuse_a","thermal_relay_min_a","thermal_relay_max_a"],
      resultLabels: {"full_load_current_a":"Tam Yük Akımı (A)","starting_current_a":"Kalkış Akımı (A)","recommended_fuse_a":"Önerilen Sigorta (A)","thermal_relay_min_a":"Termik Röle Min. (A)","thermal_relay_max_a":"Termik Röle Max. (A)"},
    },
    voltage_drop: {
      label: "Voltaj Düşümü",
      category: "electric",
      fields: [
        { key: "current_a",     label: "Akım",         type: "number", unit: "A",   default: 30,   required: true },
        { key: "length_m",      label: "Uzunluk",      type: "number", unit: "m",   default: 50,   required: true },
        { key: "section_mm2",   label: "Kesit",        type: "number", unit: "mm²", default: 6,    required: true },
        { key: "voltage_v",     label: "Gerilim",      type: "number", unit: "V",   default: 400  },
        { key: "system",        label: "Sistem",       type: "select", options: ["3phase","1phase"], default: "3phase" },
        { key: "material",      label: "Malzeme",      type: "select", options: ["copper","aluminum"], default: "copper" },
      ],
      resultKeys: ["voltage_drop_v","voltage_drop_pct","load_voltage_v"],
      resultLabels: {"voltage_drop_v":"Voltaj Düşümü (V)","voltage_drop_pct":"Voltaj Düşümü (%)","load_voltage_v":"Yük Gerilimi (V)"},
    },
    fuse_selection: {
      label: "Sigorta Seçimi",
      category: "electric",
      standard: "IEC 60269",
      fields: [
        { key: "load_current_a", label: "Yük Akımı", type: "number", unit: "A", default: 25, required: true },
        { key: "load_type",      label: "Yük Tipi",  type: "select", options: ["resistive","motor","capacitor","transformer"], default: "resistive" },
        { key: "voltage_v",      label: "Gerilim",   type: "number", unit: "V", default: 400 },
      ],
      resultKeys: ["selected_fuse_a","fuse_type","calculated_current_a"],
      resultLabels: {"selected_fuse_a":"Seçilen Sigorta (A)","fuse_type":"Sigorta Tipi","calculated_current_a":"Hesaplanan Akım (A)"},
    },
    power_factor_correction: {
      label: "Güç Faktörü Düzeltme",
      category: "electric",
      standard: "IEC 61642",
      fields: [
        { key: "active_power_kw", label: "Aktif Güç",      type: "number", unit: "kW",  default: 100,  required: true },
        { key: "current_pf",      label: "Mevcut cosφ",    type: "number", unit: "",    default: 0.75, required: true },
        { key: "target_pf",       label: "Hedef cosφ",     type: "number", unit: "",    default: 0.95 },
        { key: "voltage_v",       label: "Gerilim",        type: "number", unit: "V",   default: 400  },
      ],
      resultKeys: ["required_reactive_power_kvar","capacitance_per_phase_uf","kva_reduction"],
      resultLabels: {"required_reactive_power_kvar":"Gerekli Reaktif Güç (kVAR)","capacitance_per_phase_uf":"Kondansatör/Faz (μF)","kva_reduction":"kVA Azalması"},
    },
    short_circuit_current: {
      label: "Kısa Devre Akımı",
      category: "electric",
      standard: "IEC 60909",
      fields: [
        { key: "transformer_kva", label: "Trafo Gücü",    type: "number", unit: "kVA", default: 630,  required: true },
        { key: "impedance_pct",   label: "%Uk Empedans",  type: "number", unit: "%",   default: 6.0  },
        { key: "voltage_v",       label: "Gerilim",       type: "number", unit: "V",   default: 400  },
      ],
      resultKeys: ["short_circuit_current_a","peak_current_a","nominal_current_a"],
      resultLabels: {"short_circuit_current_a":"Kısa Devre Akımı (A)","peak_current_a":"Tepik Akım (A)","nominal_current_a":"Nominal Akım (A)"},
    },
    lighting_calculation: {
      label: "Aydınlatma Hesabı",
      category: "electric",
      standard: "TS EN 12464-1",
      fields: [
        { key: "area_m2",                    label: "Alan",                type: "number", unit: "m²",    default: 100,  required: true },
        { key: "required_lux",               label: "Gerekli Aydınlık",   type: "number", unit: "lüx",   default: 500  },
        { key: "luminaire_efficacy_lm_per_w",label: "Armatür Etkinliği", type: "number", unit: "lm/W",  default: 100  },
        { key: "utilization_factor",          label: "Kullanım Faktörü",  type: "number", unit: "",       default: 0.6  },
        { key: "maintenance_factor",          label: "Bakım Faktörü",     type: "number", unit: "",       default: 0.8  },
      ],
      resultKeys: ["required_total_lumen","total_power_w","power_density_w_m2"],
      resultLabels: {"required_total_lumen":"Toplam Işık Akısı (lm)","total_power_w":"Toplam Güç (W)","power_density_w_m2":"Işık Yoğunluğu (W/m²)"},
    },
    grounding_resistance: {
      label: "Topraklama Direnci",
      category: "electric",
      standard: "IEC 60364-5-54",
      fields: [
        { key: "rod_length_m",          label: "Çubuk Uzunluğu",    type: "number", unit: "m",     default: 2.0 },
        { key: "rod_diameter_mm",       label: "Çubuk Çapı",        type: "number", unit: "mm",    default: 16  },
        { key: "soil_resistivity_ohm_m",label: "Toprak Özdirenci", type: "number", unit: "Ω·m",   default: 100 },
      ],
      resultKeys: ["grounding_resistance_ohm","parallel_rods_for_10ohm"],
      resultLabels: {"grounding_resistance_ohm":"Topraklama Direnci (Ω)","parallel_rods_for_10ohm":"10Ω için Gerekli Paralel Çubuk"},
    },
    ohms_law: {
      label: "Ohm Yasası",
      category: "electric",
      fields: [
        { key: "voltage_v",      label: "Gerilim (V)",   type: "number", unit: "V",  default: null },
        { key: "current_a",      label: "Akım (I)",      type: "number", unit: "A",  default: null },
        { key: "resistance_ohm", label: "Direnç (R)",    type: "number", unit: "Ω",  default: null },
        { key: "power_w",        label: "Güç (P)",       type: "number", unit: "W",  default: null },
      ],
      note: "En az 2 değer girin",
      resultKeys: ["voltage_v","current_a","resistance_ohm","power_w"],
      resultLabels: {"voltage_v":"Gerilim (V)","current_a":"Akım (A)","resistance_ohm":"Direnç (Ω)","power_w":"Güç (W)"},
    },
    transformer_sizing: {
      label: "Transformatör Seçimi",
      category: "electric",
      standard: "IEC 60076",
      fields: [
        { key: "voltage_secondary_v", label: "Sekonder Gerilim", type: "number", unit: "V", default: 400 },
      ],
      note: "Yük listesi JSON olarak girin: [{\"power_kw\":50,\"pf\":0.85,\"demand_factor\":0.8}]",
      fields_extra: [
        { key: "loads_json", label: "Yük Listesi (JSON)", type: "textarea", required: true,
          default: '[{"power_kw":50,"pf":0.85,"demand_factor":0.8},{"power_kw":30,"pf":0.9,"demand_factor":0.7}]' }
      ],
      resultKeys: ["selected_transformer_kva","total_active_power_kw","total_apparent_power_kva","secondary_nominal_current_a"],
      resultLabels: {"selected_transformer_kva":"Seçilen Trafo (kVA)","total_active_power_kw":"Toplam Aktif Güç (kW)","total_apparent_power_kva":"Toplam Görünür Güç (kVA)","secondary_nominal_current_a":"Nominal Akım (A)"},
    },
    // ── ELEKTRONİK ──
    resistor_divider: {
      label: "Gerilim Bölücü",
      category: "electronic",
      fields: [
        { key: "vin",      label: "Giriş Gerilimi",  type: "number", unit: "V",  default: 12,    required: true },
        { key: "r1_ohm",   label: "R1",              type: "number", unit: "Ω",  default: 10000, required: true },
        { key: "r2_ohm",   label: "R2",              type: "number", unit: "Ω",  default: 4700,  required: true },
      ],
      resultKeys: ["output_voltage_v","current_ma","power_r1_mw","power_r2_mw","divider_ratio"],
      resultLabels: {"output_voltage_v":"Çıkış Gerilimi (V)","current_ma":"Akım (mA)","power_r1_mw":"R1 Gücü (mW)","power_r2_mw":"R2 Gücü (mW)","divider_ratio":"Bölme Oranı"},
    },
    rc_filter: {
      label: "RC Filtre",
      category: "electronic",
      fields: [
        { key: "resistance_ohm",   label: "Direnç",       type: "number", unit: "Ω",  default: 10000, required: true },
        { key: "capacitance_uf",   label: "Kondansatör",  type: "number", unit: "μF", default: 0.1,   required: true },
        { key: "filter_type",      label: "Filtre Tipi",  type: "select", options: ["lowpass","highpass"], default: "lowpass" },
      ],
      resultKeys: ["cutoff_frequency_hz","time_constant_ms"],
      resultLabels: {"cutoff_frequency_hz":"Kesme Frekansı (Hz)","time_constant_ms":"Zaman Sabiti (ms)"},
    },
    led_resistor: {
      label: "LED Direnç Hesabı",
      category: "electronic",
      fields: [
        { key: "supply_v",        label: "Besleme Gerilimi", type: "number", unit: "V",  default: 5,   required: true },
        { key: "led_forward_v",   label: "LED İleri Gerilim",type: "number", unit: "V",  default: 2.0 },
        { key: "led_current_ma",  label: "LED Akımı",        type: "number", unit: "mA", default: 20  },
      ],
      resultKeys: ["standard_resistance_ohm","actual_current_ma","power_dissipation_mw","recommended_wattage"],
      resultLabels: {"standard_resistance_ohm":"Standart Direnç (Ω)","actual_current_ma":"Gerçek Akım (mA)","power_dissipation_mw":"Güç Kaybı (mW)","recommended_wattage":"Önerilen Watt"},
    },
    series_parallel_resistor: {
      label: "Seri/Paralel Direnç",
      category: "electronic",
      note: "Direnç değerlerini virgülle ayırın",
      fields: [
        { key: "resistors_csv",  label: "Dirençler (Ω)", type: "text",   unit: "",  default: "100,220,330", required: true },
        { key: "connection",     label: "Bağlantı",      type: "select", options: ["series","parallel"], default: "series" },
      ],
      resultKeys: ["total_resistance_ohm","connection_type"],
      resultLabels: {"total_resistance_ohm":"Toplam Direnç (Ω)","connection_type":"Bağlantı Tipi"},
    },
    capacitor_energy: {
      label: "Kondansatör Enerjisi",
      category: "electronic",
      fields: [
        { key: "capacitance_uf", label: "Kapasitans",  type: "number", unit: "μF", default: 1000, required: true },
        { key: "voltage_v",      label: "Gerilim",     type: "number", unit: "V",  default: 24,   required: true },
      ],
      resultKeys: ["energy_joules","charge_microcoulombs"],
      resultLabels: {"energy_joules":"Enerji (J)","charge_microcoulombs":"Yük (μC)"},
    },
    // ── OTOMASYON ──
    pneumatic_cylinder_force: {
      label: "Pnömatik Silindir Kuvveti",
      category: "automation",
      standard: "ISO 6432 / ISO 15552",
      fields: [
        { key: "bore_mm",          label: "Piston Çapı",     type: "number", unit: "mm",  default: 63,  required: true },
        { key: "pressure_bar",     label: "Basınç",          type: "number", unit: "bar", default: 6.0, required: true },
        { key: "rod_mm",           label: "Mil Çapı",        type: "number", unit: "mm",  default: 20  },
        { key: "stroke_direction", label: "Hareket Yönü",    type: "select", options: ["extend","retract"], default: "extend" },
        { key: "efficiency",       label: "Verim",           type: "number", unit: "",    default: 0.85 },
      ],
      resultKeys: ["actual_force_n","actual_force_kgf","theoretical_force_n","effective_area_cm2"],
      resultLabels: {"actual_force_n":"Gerçek Kuvvet (N)","actual_force_kgf":"Gerçek Kuvvet (kgf)","theoretical_force_n":"Teorik Kuvvet (N)","effective_area_cm2":"Etkin Alan (cm²)"},
    },
    pneumatic_air_consumption: {
      label: "Pnömatik Hava Tüketimi",
      category: "automation",
      fields: [
        { key: "bore_mm",              label: "Piston Çapı",     type: "number", unit: "mm",   default: 63,  required: true },
        { key: "stroke_mm",            label: "Strok",           type: "number", unit: "mm",   default: 200, required: true },
        { key: "cycles_per_min",       label: "Çevrim/Dak.",     type: "number", unit: "1/dk", default: 10,  required: true },
        { key: "working_pressure_bar", label: "Çalışma Basıncı", type: "number", unit: "bar",  default: 6.0 },
        { key: "rod_mm",               label: "Mil Çapı",        type: "number", unit: "mm",   default: 20  },
      ],
      resultKeys: ["consumption_dm3_per_min","consumption_nm3_per_hour","consumption_per_cycle_dm3"],
      resultLabels: {"consumption_dm3_per_min":"Tüketim (dm³/dk)","consumption_nm3_per_hour":"Tüketim (Nm³/saat)","consumption_per_cycle_dm3":"Çevrim Başına (dm³)"},
    },
    vfd_selection: {
      label: "VFD Sürücü Seçimi",
      category: "automation",
      standard: "IEC 61800-2",
      fields: [
        { key: "motor_power_kw",   label: "Motor Gücü",      type: "number", unit: "kW", default: 22, required: true },
        { key: "overload_factor",  label: "Yük Darbesi Kat.", type: "number", unit: "×",  default: 1.5 },
        { key: "altitude_m",       label: "İrtifa",          type: "number", unit: "m",  default: 0 },
      ],
      resultKeys: ["selected_vfd_kw","required_vfd_kw"],
      resultLabels: {"selected_vfd_kw":"Seçilen VFD (kW)","required_vfd_kw":"Gerekli VFD (kW)"},
    },
    plc_io_count: {
      label: "PLC I/O Hesabı",
      category: "automation",
      fields: [
        { key: "digital_inputs",  label: "Dijital Giriş (DI)",  type: "number", unit: "adet", default: 32, required: true },
        { key: "digital_outputs", label: "Dijital Çıkış (DO)",  type: "number", unit: "adet", default: 24, required: true },
        { key: "analog_inputs",   label: "Analog Giriş (AI)",   type: "number", unit: "adet", default: 8  },
        { key: "analog_outputs",  label: "Analog Çıkış (AO)",   type: "number", unit: "adet", default: 4  },
        { key: "spare_pct",       label: "Yedek %",             type: "number", unit: "%",    default: 20 },
      ],
      resultKeys: ["required_di","required_do","modules_di","modules_do","modules_ai","modules_ao","total_modules","power_supplies"],
      resultLabels: {"required_di":"Gerekli DI","required_do":"Gerekli DO","modules_di":"DI Modülü","modules_do":"DO Modülü","modules_ai":"AI Modülü","modules_ao":"AO Modülü","total_modules":"Toplam Modül","power_supplies":"Güç Kaynağı"},
    },
    conveyor_capacity: {
      label: "Konveyör Kapasitesi",
      category: "automation",
      fields: [
        { key: "belt_width_mm",          label: "Bant Genişliği",    type: "number", unit: "mm",      default: 600, required: true },
        { key: "belt_speed_m_s",         label: "Bant Hızı",         type: "number", unit: "m/s",     default: 1.5, required: true },
        { key: "material_density_kg_m3", label: "Malzeme Yoğunluğu", type: "number", unit: "kg/m³",   default: 1600 },
        { key: "inclination_deg",        label: "Eğim Açısı",        type: "number", unit: "°",       default: 0   },
        { key: "fill_factor",            label: "Dolum Faktörü",     type: "number", unit: "",        default: 0.75 },
      ],
      resultKeys: ["capacity_t_per_hour","volumetric_capacity_m3_h","estimated_drive_power_kw"],
      resultLabels: {"capacity_t_per_hour":"Kapasite (t/saat)","volumetric_capacity_m3_h":"Hacimsel Kapasite (m³/saat)","estimated_drive_power_kw":"Tahmini Sürücü Gücü (kW)"},
    },
    pid_tuning_ziegler_nichols: {
      label: "PID Parametre Hesabı (Z-N)",
      category: "automation",
      fields: [
        { key: "ultimate_gain_ku",    label: "Kritik Kazanç (Ku)",   type: "number", unit: "",  default: 1.5, required: true },
        { key: "ultimate_period_pu",  label: "Kritik Periyot (Pu)",  type: "number", unit: "s", default: 10,  required: true },
        { key: "controller_type",     label: "Kontrolör Tipi",       type: "select", options: ["p","pi","pid"], default: "pid" },
      ],
      resultKeys: ["kp","ki","kd","ti","td"],
      resultLabels: {"kp":"Kp (Oransal)","ki":"Ki (İntegral)","kd":"Kd (Türevsel)","ti":"Ti (s)","td":"Td (s)"},
    },
    encoder_resolution: {
      label: "Enkoder Çözünürlüğü",
      category: "automation",
      fields: [
        { key: "pulses_per_rev", label: "Darbe/Tur (PPR)", type: "number", unit: "ppr", default: 1024, required: true },
        { key: "gear_ratio",     label: "Dişli Oranı",     type: "number", unit: "×",   default: 1.0  },
        { key: "lead_mm",        label: "Vida Adımı (opt)", type: "number", unit: "mm",  default: null },
      ],
      resultKeys: ["angular_resolution_deg","angular_resolution_arcmin","linear_resolution_um"],
      resultLabels: {"angular_resolution_deg":"Açısal Çözünürlük (°)","angular_resolution_arcmin":"Açısal Çözünürlük (')","linear_resolution_um":"Doğrusal Çözünürlük (μm)"},
    },
  };

  const CAT_LABELS = { electric: "Elektrik", electronic: "Elektronik", automation: "Otomasyon" };

  let _currentCalc = null;
  let _lastResult = null;

  // ─── Ana load ──────────────────────────────────────────────────────
  function load() {
    _renderCategories();
  }

  function _renderCategories() {
    const wrap = document.getElementById('calc-content');
    if (!wrap) return;

    const cats = { electric: [], electronic: [], automation: [] };
    Object.entries(CALC_DEFS).forEach(([key, def]) => {
      if (cats[def.category]) cats[def.category].push({ key, ...def });
    });

    wrap.innerHTML = `
      <div class="calc-layout">
        <aside class="calc-sidebar">
          ${Object.entries(cats).map(([cat, items]) => `
            <div class="calc-cat-group">
              <div class="calc-cat-header">${CAT_LABELS[cat] || cat}</div>
              ${items.map(item => `
                <button class="calc-item-btn" data-key="${item.key}" onclick="Calculations.selectCalc('${item.key}')">
                  ${UI.esc(item.label)}
                </button>
              `).join('')}
            </div>
          `).join('')}
        </aside>
        <main id="calc-main" class="calc-main">
          <div class="calc-welcome">
            <p>Sol taraftan bir hesaplama seçin.</p>
          </div>
        </main>
      </div>
    `;
  }

  function selectCalc(key) {
    _currentCalc = key;
    const def = CALC_DEFS[key];
    if (!def) return;

    // Sidebar aktif item
    document.querySelectorAll('.calc-item-btn').forEach(b => b.classList.toggle('active', b.dataset.key === key));

    const main = document.getElementById('calc-main');
    if (!main) return;

    const allFields = [...(def.fields || []), ...(def.fields_extra || [])];

    const fieldsHtml = allFields.map(f => {
      const val = f.default != null ? f.default : '';
      if (f.type === 'select') {
        return `
          <div class="calc-field-row">
            <label>${UI.esc(f.label)}</label>
            <select name="${f.key}">
              ${f.options.map(o => `<option value="${o}" ${o === f.default ? 'selected' : ''}>${o}</option>`).join('')}
            </select>
          </div>`;
      }
      if (f.type === 'textarea') {
        return `
          <div class="calc-field-row calc-field-wide">
            <label>${UI.esc(f.label)}</label>
            <textarea name="${f.key}" rows="3">${val}</textarea>
          </div>`;
      }
      if (f.type === 'text') {
        return `
          <div class="calc-field-row">
            <label>${UI.esc(f.label)}${f.unit ? ` <span class="calc-unit">(${f.unit})</span>` : ''}</label>
            <input type="text" name="${f.key}" value="${UI.esc(String(val))}" ${f.required ? 'required' : ''}>
          </div>`;
      }
      return `
        <div class="calc-field-row">
          <label>${UI.esc(f.label)}${f.unit ? ` <span class="calc-unit">(${f.unit})</span>` : ''}</label>
          <input type="number" name="${f.key}" value="${val !== '' ? val : ''}" step="any" ${f.required ? 'required' : ''}>
        </div>`;
    }).join('');

    main.innerHTML = `
      <div class="calc-panel">
        <div class="calc-panel-header">
          <h3>${UI.esc(def.label)}</h3>
          ${def.standard ? `<span class="calc-standard">${UI.esc(def.standard)}</span>` : ''}
          ${def.note ? `<p class="calc-note">ℹ️ ${UI.esc(def.note)}</p>` : ''}
        </div>
        <form id="calc-form" onsubmit="return false">
          <div class="calc-fields">${fieldsHtml}</div>
          <div class="calc-actions">
            <button class="btn btn-primary" onclick="Calculations.runCalc()">Hesapla</button>
            <button class="btn btn-secondary" onclick="Calculations.saveCalc()">Kaydet</button>
          </div>
        </form>
        <div id="calc-result"></div>
      </div>
    `;
  }

  async function runCalc() {
    if (!_currentCalc) return;
    const def = CALC_DEFS[_currentCalc];
    const form = document.getElementById('calc-form');
    if (!form) return;

    const inputs = {};
    const allFields = [...(def.fields || []), ...(def.fields_extra || [])];
    for (const f of allFields) {
      const el = form.querySelector(`[name="${f.key}"]`);
      if (!el || el.value === '' || el.value === 'null') continue;
      if (f.key === 'loads_json') {
        try { inputs['loads'] = JSON.parse(el.value); } catch (e) { /* ignore parse error */ }
        continue;
      }
      if (f.key === 'resistors_csv') {
        inputs['resistors'] = el.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        continue;
      }
      if (f.type === 'select' || f.type === 'textarea' || f.type === 'text') {
        inputs[f.key] = el.value;
      } else {
        const n = parseFloat(el.value);
        if (!isNaN(n)) inputs[f.key] = n;
      }
    }

    const resultDiv = document.getElementById('calc-result');
    resultDiv.innerHTML = '<p class="muted" style="padding:12px">Hesaplanıyor…</p>';

    try {
      const data = await API.post('/calculations/run', { calc_type: _currentCalc, inputs });
      _lastResult = data;
      _renderResult(data, def);
    } catch (e) {
      resultDiv.innerHTML = `<p class="error-state" style="padding:12px;color:#c5221f">Hata: ${UI.esc(e.message || JSON.stringify(e))}</p>`;
    }
  }

  function _renderResult(data, def) {
    const resultDiv = document.getElementById('calc-result');
    if (!resultDiv) return;
    const result = data.result || {};
    const warnings = data.warnings || [];

    const rows = (def.resultKeys || Object.keys(result))
      .filter(k => result[k] != null)
      .map(k => {
        const label = (def.resultLabels || {})[k] || k;
        let val = result[k];
        if (typeof val === 'number') val = val.toLocaleString('tr-TR', { maximumFractionDigits: 4 });
        return `<tr><td class="calc-res-label">${UI.esc(label)}</td><td class="calc-res-val"><strong>${UI.esc(String(val))}</strong></td></tr>`;
      }).join('');

    const warnHtml = warnings.length
      ? `<div class="calc-warnings">${warnings.map(w => `<div class="calc-warn-item">⚠️ ${UI.esc(w)}</div>`).join('')}</div>`
      : '';

    resultDiv.innerHTML = `
      <div class="calc-result-box">
        <h4>Sonuçlar</h4>
        ${warnHtml}
        <table class="calc-result-table"><tbody>${rows}</tbody></table>
      </div>
    `;
  }

  async function saveCalc() {
    if (!_lastResult || !_currentCalc) {
      alert('Önce hesaplama yapın.');
      return;
    }
    const def = CALC_DEFS[_currentCalc];
    const title = prompt('Hesaplama adı:', def.label);
    if (!title) return;

    try {
      await API.post('/calculations/save', {
        category: def.category,
        calc_type: _currentCalc,
        title,
        inputs: _lastResult.inputs,
        result: _lastResult.result,
      });
      alert('Kaydedildi!');
    } catch (e) {
      alert('Kaydetme hatası: ' + (e.message || ''));
    }
  }

  return { load, selectCalc, runCalc, saveCalc };
})();
