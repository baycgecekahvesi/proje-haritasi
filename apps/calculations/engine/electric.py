"""
Elektrik hesaplama motoru.
Tüm hesaplamalar IEC 60364 ve TS EN standartlarına göre.
"""
from __future__ import annotations
import math


def cable_section(
    current_a: float,          # Akım (A)
    length_m: float,           # Kablo uzunluğu (m)
    voltage_v: float = 400.0,  # Gerilim (V)
    power_factor: float = 0.85,
    system: str = "3phase",    # "3phase" veya "1phase"
    material: str = "copper",  # "copper" veya "aluminum"
    max_voltage_drop_pct: float = 3.0,
    installation: str = "conduit",  # conduit / tray / direct
) -> dict:
    """
    IEC 60364-5-52 kablo kesiti hesabı.
    Hem akım taşıma kapasitesi hem de voltaj düşümü kriterini kontrol eder.
    """
    warnings = []

    # Özdirenç (Ω·mm²/m @ 70°C)
    rho = 0.0179 if material == "copper" else 0.0290

    # Voltaj düşümü kriterine göre minimum kesit
    if system == "3phase":
        # ΔU = √3 × I × L × ρ / S  →  S = √3 × I × L × ρ / ΔU_max
        delta_u_max = voltage_v * max_voltage_drop_pct / 100
        s_voltage = (math.sqrt(3) * current_a * length_m * rho) / delta_u_max
    else:
        delta_u_max = voltage_v * max_voltage_drop_pct / 100
        s_voltage = (2 * current_a * length_m * rho) / delta_u_max

    # Standart kesitler (mm²)
    standard_sections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300]

    # Akım taşıma kapasitesi referans tablosu (Cu, XLPE, 30°C, conduit)
    capacity_table = {
        1.5: 14.5, 2.5: 19.5, 4: 26, 6: 34, 10: 46,
        16: 61, 25: 80, 35: 99, 50: 119, 70: 151,
        95: 182, 120: 210, 150: 240, 185: 273, 240: 321, 300: 367,
    }
    # Alüminyum için 0.78 çarpanı
    if material == "aluminum":
        capacity_table = {k: round(v * 0.78) for k, v in capacity_table.items()}
    # Açık tray için 1.15 çarpanı
    if installation == "tray":
        capacity_table = {k: round(v * 1.15) for k, v in capacity_table.items()}

    # Akım kapasitesi kriterine göre minimum kesit
    s_current = None
    for s in standard_sections:
        if capacity_table.get(s, 0) >= current_a:
            s_current = s
            break

    if s_current is None:
        s_current = standard_sections[-1]
        warnings.append("300 mm² üzeri kesit gerekiyor, paralel kablo düşünün.")

    # Her iki kriterden büyük olanı seç
    s_required = max(s_voltage, s_current if s_current else 0)
    selected_section = next((s for s in standard_sections if s >= s_required), standard_sections[-1])

    # Seçilen kesit için gerçek voltaj düşümü
    if system == "3phase":
        actual_vd = (math.sqrt(3) * current_a * length_m * rho) / selected_section
    else:
        actual_vd = (2 * current_a * length_m * rho) / selected_section

    actual_vd_pct = actual_vd / voltage_v * 100

    if actual_vd_pct > max_voltage_drop_pct:
        warnings.append(f"Voltaj düşümü %{actual_vd_pct:.2f} — sınır %{max_voltage_drop_pct}")

    return {
        "selected_section_mm2":  selected_section,
        "min_section_by_current_mm2": s_current,
        "min_section_by_voltage_drop_mm2": round(s_voltage, 2),
        "actual_voltage_drop_v":  round(actual_vd, 2),
        "actual_voltage_drop_pct": round(actual_vd_pct, 2),
        "current_capacity_a":    capacity_table.get(selected_section, 0),
        "material":              material,
        "warnings":              warnings,
        "standard":              "IEC 60364-5-52",
    }


def motor_current(
    power_kw: float,
    voltage_v: float = 380.0,
    efficiency: float = 0.92,
    power_factor: float = 0.85,
    system: str = "3phase",
) -> dict:
    """Asenkron motor tam yük akımı hesabı."""
    if system == "3phase":
        i_full = (power_kw * 1000) / (math.sqrt(3) * voltage_v * efficiency * power_factor)
    else:
        i_full = (power_kw * 1000) / (voltage_v * efficiency * power_factor)

    # Kalkış akımı (tipik 6-7×)
    i_start = i_full * 6.5

    # Sigorta önerisi (motor koruma: 1.25×, TS EN 60947-4-1)
    i_fuse = i_full * 2.5  # motor sigortası (kalkış akımı için)

    # Termik röle ayarı
    i_thermal_min = i_full * 0.9
    i_thermal_max = i_full * 1.05

    return {
        "full_load_current_a":   round(i_full, 2),
        "starting_current_a":    round(i_start, 2),
        "recommended_fuse_a":    round(i_fuse, 1),
        "thermal_relay_min_a":   round(i_thermal_min, 2),
        "thermal_relay_max_a":   round(i_thermal_max, 2),
        "input_apparent_power_kva": round(power_kw / (efficiency * power_factor), 2),
        "standard": "TS EN 60947-4-1",
    }


def fuse_selection(
    load_current_a: float,
    load_type: str = "resistive",  # "resistive" / "motor" / "capacitor" / "transformer"
    voltage_v: float = 400.0,
) -> dict:
    """IEC 60269 sigorta seçimi."""
    multipliers = {"resistive": 1.25, "motor": 2.5, "capacitor": 1.5, "transformer": 1.6}
    mult = multipliers.get(load_type, 1.25)
    i_calc = load_current_a * mult

    standard_fuses = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630]
    selected = next((f for f in standard_fuses if f >= i_calc), standard_fuses[-1])

    return {
        "calculated_current_a": round(i_calc, 1),
        "selected_fuse_a":      selected,
        "fuse_type":            "gG" if load_type != "motor" else "gM",
        "load_multiplier":      mult,
        "standard":             "IEC 60269",
    }


def transformer_sizing(
    loads: list,  # [{"power_kw": 50, "pf": 0.85, "demand_factor": 0.8}, ...]
    voltage_primary_kv: float = 10.0,
    voltage_secondary_v: float = 400.0,
) -> dict:
    """Transformatör güç hesabı ve seçimi."""
    total_kva = 0.0
    total_kw = 0.0
    for load in loads:
        kw = load.get("power_kw", 0) * load.get("demand_factor", 1.0)
        pf = load.get("pf", 0.85)
        total_kw += kw
        total_kva += kw / pf if pf > 0 else kw

    # %20 yedek kapasite
    required_kva = total_kva * 1.20

    standard_transformers = [25, 50, 100, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500]
    selected_kva = next((t for t in standard_transformers if t >= required_kva), standard_transformers[-1])

    # Nominal akım (sekonder)
    i_secondary = (selected_kva * 1000) / (math.sqrt(3) * voltage_secondary_v)

    return {
        "total_active_power_kw":    round(total_kw, 2),
        "total_apparent_power_kva": round(total_kva, 2),
        "required_kva_with_reserve": round(required_kva, 2),
        "selected_transformer_kva": selected_kva,
        "secondary_nominal_current_a": round(i_secondary, 1),
        "standard": "IEC 60076",
    }


def voltage_drop(
    current_a: float,
    length_m: float,
    section_mm2: float,
    voltage_v: float = 400.0,
    system: str = "3phase",
    material: str = "copper",
) -> dict:
    """Kablo voltaj düşümü hesabı."""
    rho = 0.0179 if material == "copper" else 0.0290
    if system == "3phase":
        vd = math.sqrt(3) * current_a * length_m * rho / section_mm2
    else:
        vd = 2 * current_a * length_m * rho / section_mm2

    vd_pct = vd / voltage_v * 100
    v_load = voltage_v - vd

    warnings = []
    if vd_pct > 5.0:
        warnings.append("Kritik voltaj düşümü!")
    elif vd_pct > 3.0:
        warnings.append(f"Voltaj düşümü %{vd_pct:.2f} — IEC 60364 sınırı %3 aşıldı!")

    return {
        "voltage_drop_v":   round(vd, 3),
        "voltage_drop_pct": round(vd_pct, 3),
        "load_voltage_v":   round(v_load, 2),
        "warnings":         warnings,
    }


def power_factor_correction(
    active_power_kw: float,
    current_pf: float,
    target_pf: float = 0.95,
    voltage_v: float = 400.0,
    frequency_hz: float = 50.0,
) -> dict:
    """Güç faktörü düzeltme kondansatör hesabı."""
    phi1 = math.acos(current_pf)
    phi2 = math.acos(target_pf)
    q_required_kvar = active_power_kw * (math.tan(phi1) - math.tan(phi2))

    # Kondansatör kapasitansı
    v_rms = voltage_v / math.sqrt(3)  # faz gerilimi
    c_uf = (q_required_kvar * 1000) / (2 * math.pi * frequency_hz * v_rms**2) * 1e6

    # Mevcut ve hedef güç
    s_before = active_power_kw / current_pf
    s_after  = active_power_kw / target_pf

    return {
        "required_reactive_power_kvar": round(q_required_kvar, 2),
        "capacitance_per_phase_uf":     round(c_uf, 2),
        "apparent_power_before_kva":    round(s_before, 2),
        "apparent_power_after_kva":     round(s_after, 2),
        "kva_reduction":                round(s_before - s_after, 2),
        "standard": "IEC 61642",
    }


def short_circuit_current(
    transformer_kva: float,
    impedance_pct: float = 6.0,  # %Uk
    voltage_v: float = 400.0,
) -> dict:
    """Transformatör sekonder kısa devre akımı (IEC 60909)."""
    i_nominal = (transformer_kva * 1000) / (math.sqrt(3) * voltage_v)
    i_sc = i_nominal / (impedance_pct / 100)
    i_peak = i_sc * 1.8 * math.sqrt(2)  # tepik değer (κ=1.8 tipik)

    return {
        "nominal_current_a":     round(i_nominal, 1),
        "short_circuit_current_a": round(i_sc, 1),
        "peak_current_a":        round(i_peak, 1),
        "impedance_pct":         impedance_pct,
        "standard": "IEC 60909",
    }


def lighting_calculation(
    area_m2: float,
    required_lux: float = 500.0,  # TS EN 12464-1
    luminaire_efficacy_lm_per_w: float = 100.0,
    utilization_factor: float = 0.6,
    maintenance_factor: float = 0.8,
) -> dict:
    """Aydınlatma hesabı — lümen metodu (TS EN 12464-1)."""
    # Gerekli toplam lümen
    total_lumen = required_lux * area_m2 / (utilization_factor * maintenance_factor)

    # Güç
    total_power_w = total_lumen / luminaire_efficacy_lm_per_w

    # Işık yoğunluğu (W/m²)
    power_density = total_power_w / area_m2

    warnings = []
    if power_density > 15:
        warnings.append(f"Işık yoğunluğu {power_density:.1f} W/m² yüksek — LED armatür öneririz")

    return {
        "required_total_lumen":  round(total_lumen, 0),
        "total_power_w":         round(total_power_w, 1),
        "power_density_w_m2":    round(power_density, 2),
        "warnings":              warnings,
        "standard": "TS EN 12464-1",
    }


def grounding_resistance(
    rod_length_m: float = 2.0,
    rod_diameter_mm: float = 16.0,
    soil_resistivity_ohm_m: float = 100.0,  # kuru toprak ~100, ıslak ~30
) -> dict:
    """Toprak çubuğu direnci hesabı (Dwight formülü)."""
    d = rod_diameter_mm / 1000  # metre
    L = rod_length_m
    rho = soil_resistivity_ohm_m

    R = (rho / (2 * math.pi * L)) * (math.log(4 * L / d) - 1)

    warnings = []
    if R > 10:
        warnings.append(f"Topraklama direnci {R:.1f} Ω — IEC 60364 için birden fazla çubuk veya mesh gerekebilir")
    if R > 1:
        warnings.append("Kritik tesisler için R < 1 Ω önerilir")

    parallel_rods_needed = math.ceil(R / 10) if R > 10 else 1

    return {
        "grounding_resistance_ohm":    round(R, 2),
        "soil_resistivity_ohm_m":      rho,
        "parallel_rods_for_10ohm":     parallel_rods_needed,
        "warnings":                    warnings,
        "standard": "IEC 60364-5-54",
    }


def ohms_law(
    voltage_v: float = None,
    current_a: float = None,
    resistance_ohm: float = None,
    power_w: float = None,
) -> dict:
    """Ohm Yasası ve güç hesabı — verilen 2 değerden diğerlerini hesapla."""
    given = {k: v for k, v in {
        "V": voltage_v, "I": current_a, "R": resistance_ohm, "P": power_w
    }.items() if v is not None}

    V, I, R, P = voltage_v, current_a, resistance_ohm, power_w

    if "V" in given and "I" in given:
        R = V / I; P = V * I
    elif "V" in given and "R" in given:
        I = V / R; P = V * I
    elif "I" in given and "R" in given:
        V = I * R; P = V * I
    elif "P" in given and "V" in given:
        I = P / V; R = V / I
    elif "P" in given and "I" in given:
        V = P / I; R = V / I
    elif "P" in given and "R" in given:
        I = math.sqrt(P / R); V = I * R
    else:
        return {"error": "En az 2 değer giriniz"}

    return {
        "voltage_v":     round(V, 4) if V else None,
        "current_a":     round(I, 4) if I else None,
        "resistance_ohm": round(R, 4) if R else None,
        "power_w":       round(P, 4) if P else None,
    }
