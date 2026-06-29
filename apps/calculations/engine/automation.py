"""Otomasyon ve pnömatik hesaplama motoru."""
from __future__ import annotations
import math


def pneumatic_cylinder_force(
    bore_mm: float,
    pressure_bar: float,
    rod_mm: float = 0.0,
    stroke_direction: str = "extend",  # "extend" / "retract"
    efficiency: float = 0.85,
) -> dict:
    """
    Pnömatik silindir kuvvet hesabı.
    ISO 6432 / ISO 15552 standartlarına göre.
    """
    bore_m = bore_mm / 1000
    rod_m = rod_mm / 1000
    pressure_pa = pressure_bar * 1e5

    a_bore = math.pi * bore_m ** 2 / 4  # piston alanı (m²)
    a_rod  = math.pi * rod_m  ** 2 / 4  # mil alanı (m²)

    if stroke_direction == "extend":
        effective_area = a_bore
    else:
        effective_area = a_bore - a_rod

    theoretical_force_n = pressure_pa * effective_area
    actual_force_n = theoretical_force_n * efficiency

    return {
        "theoretical_force_n":     round(theoretical_force_n, 1),
        "actual_force_n":          round(actual_force_n, 1),
        "theoretical_force_kgf":   round(theoretical_force_n / 9.81, 2),
        "actual_force_kgf":        round(actual_force_n / 9.81, 2),
        "effective_area_cm2":      round(effective_area * 1e4, 3),
        "bore_mm":                 bore_mm,
        "pressure_bar":            pressure_bar,
        "stroke_direction":        stroke_direction,
        "standard": "ISO 6432 / ISO 15552",
    }


def pneumatic_air_consumption(
    bore_mm: float,
    stroke_mm: float,
    cycles_per_min: float,
    working_pressure_bar: float,
    rod_mm: float = 0.0,
) -> dict:
    """Pnömatik silindir hava tüketimi hesabı."""
    bore_m = bore_mm / 1000
    rod_m  = rod_mm / 1000
    stroke_m = stroke_mm / 1000

    a_bore = math.pi * bore_m ** 2 / 4
    a_ann  = math.pi * bore_m ** 2 / 4 - math.pi * rod_m ** 2 / 4

    # Atmosferik basınca indirgenmiş hacim
    p_abs = working_pressure_bar + 1.013

    # Her çevrimde tüketilen hava (dm³)
    v_extend = a_bore * stroke_m * p_abs * 1000   # dm³
    v_retract = a_ann  * stroke_m * p_abs * 1000

    q_total_dm3_per_cycle = v_extend + v_retract
    q_dm3_per_min = q_total_dm3_per_cycle * cycles_per_min
    q_nm3_per_hour = q_dm3_per_min * 60 / 1000  # Nm³/saat

    return {
        "consumption_per_cycle_dm3":  round(q_total_dm3_per_cycle, 3),
        "consumption_dm3_per_min":    round(q_dm3_per_min, 2),
        "consumption_nm3_per_hour":   round(q_nm3_per_hour, 3),
        "working_pressure_bar":       working_pressure_bar,
        "cycles_per_min":             cycles_per_min,
    }


def vfd_selection(
    motor_power_kw: float,
    overload_factor: float = 1.5,  # kalkış/yük darbesi
    altitude_m: float = 0.0,
) -> dict:
    """VFD (Sürücü) seçimi — IEC 61800-2."""
    # Yükseklik derating
    if altitude_m > 1000:
        derating = 1 - 0.001 * (altitude_m - 1000) * 0.01
    else:
        derating = 1.0

    required_kva = motor_power_kw * overload_factor / 0.95 / derating

    # Standart VFD güçleri (kW)
    std_vfd = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3.0, 4.0, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 400, 500]
    selected_kw = next((v for v in std_vfd if v >= motor_power_kw * overload_factor), std_vfd[-1])

    warnings = []
    if altitude_m > 2000:
        warnings.append(f"Yüksek irtifa ({altitude_m}m) — derating %{round((1-derating)*100, 1)} uygulandı")

    return {
        "motor_power_kw":         motor_power_kw,
        "required_vfd_kw":        round(motor_power_kw * overload_factor, 2),
        "selected_vfd_kw":        selected_kw,
        "altitude_derating_factor": round(derating, 3),
        "warnings":               warnings,
        "standard": "IEC 61800-2",
    }


def conveyor_capacity(
    belt_width_mm: float,
    belt_speed_m_s: float,
    material_density_kg_m3: float = 1600.0,
    inclination_deg: float = 0.0,
    fill_factor: float = 0.75,
) -> dict:
    """Konveyör bant kapasitesi hesabı (CEMA standartları)."""
    b = belt_width_mm / 1000  # m
    # Etkin taşıma genişliği (~%8 kenar boşluğu)
    b_eff = b * 0.9
    # Yük kesit alanı (trapez profil)
    a_section = fill_factor * 0.11 * b_eff ** 2  # ampirik

    # Teorik hacimsel kapasite (m³/s)
    q_vol = a_section * belt_speed_m_s

    # Kütlesel kapasite (t/saat)
    q_mass = q_vol * material_density_kg_m3 * 3.6

    # Eğim faktörü
    inclination_factor = math.cos(math.radians(inclination_deg))
    q_inclined = q_mass * inclination_factor

    # Gerekli motor gücü (yaklaşık)
    p_kw = q_mass * (0.003 * 1.0 + math.sin(math.radians(inclination_deg)) / 3.6)

    return {
        "capacity_t_per_hour":         round(q_mass, 1),
        "capacity_inclined_t_per_hour": round(q_inclined, 1),
        "volumetric_capacity_m3_h":     round(q_vol * 3600, 2),
        "estimated_drive_power_kw":     round(abs(p_kw), 2),
        "fill_factor":                  fill_factor,
        "inclination_deg":              inclination_deg,
    }


def plc_io_count(
    digital_inputs: int,
    digital_outputs: int,
    analog_inputs: int = 0,
    analog_outputs: int = 0,
    spare_pct: float = 20.0,
) -> dict:
    """PLC I/O noktası hesabı ve modül önerisi."""
    spare = spare_pct / 100

    total_di = math.ceil(digital_inputs * (1 + spare))
    total_do = math.ceil(digital_outputs * (1 + spare))
    total_ai = math.ceil(analog_inputs * (1 + spare))
    total_ao = math.ceil(analog_outputs * (1 + spare))

    # Standart modül kapasiteleri
    di_module = 16; do_module = 16; ai_module = 8; ao_module = 4

    modules_di = math.ceil(total_di / di_module)
    modules_do = math.ceil(total_do / do_module)
    modules_ai = math.ceil(total_ai / ai_module) if total_ai > 0 else 0
    modules_ao = math.ceil(total_ao / ao_module) if total_ao > 0 else 0

    total_modules = modules_di + modules_do + modules_ai + modules_ao
    # Güç kaynağı: her 8 modülde bir PS
    power_supplies = math.ceil(total_modules / 8)

    return {
        "required_di":   total_di,
        "required_do":   total_do,
        "required_ai":   total_ai,
        "required_ao":   total_ao,
        "modules_di":    modules_di,
        "modules_do":    modules_do,
        "modules_ai":    modules_ai,
        "modules_ao":    modules_ao,
        "total_modules": total_modules,
        "power_supplies": power_supplies,
        "spare_percent": spare_pct,
        "note": "16-DI/16-DO/8-AI/4-AO modül kapasitelerine göre hesaplanmıştır",
    }


def pid_tuning_ziegler_nichols(
    ultimate_gain_ku: float,
    ultimate_period_pu: float,
    controller_type: str = "pid",  # "p" / "pi" / "pid"
) -> dict:
    """Ziegler-Nichols PID parametre hesabı."""
    if controller_type == "p":
        kp = 0.5 * ultimate_gain_ku
        ki = ti = kd = td = 0
    elif controller_type == "pi":
        kp = 0.45 * ultimate_gain_ku
        ti = 0.833 * ultimate_period_pu
        ki = kp / ti if ti else 0
        kd = td = 0
    else:  # PID
        kp = 0.6 * ultimate_gain_ku
        ti = 0.5 * ultimate_period_pu
        td = 0.125 * ultimate_period_pu
        ki = kp / ti if ti else 0
        kd = kp * td

    return {
        "kp": round(kp, 4),
        "ki": round(ki, 6),
        "kd": round(kd, 4),
        "ti": round(ti, 4),
        "td": round(td, 4),
        "method": "Ziegler-Nichols",
        "controller_type": controller_type,
        "note": "Başlangıç değerleridir, sistem üzerinde ince ayar gerekir",
    }


def encoder_resolution(
    pulses_per_rev: int,
    gear_ratio: float = 1.0,
    lead_mm: float = None,   # vida adımı (mm) — doğrusal hareket için
) -> dict:
    """Enkoder çözünürlük ve hassasiyet hesabı."""
    angular_resolution_deg = 360.0 / (pulses_per_rev * gear_ratio)

    result = {
        "angular_resolution_deg":   round(angular_resolution_deg, 6),
        "angular_resolution_arcmin": round(angular_resolution_deg * 60, 4),
        "pulses_per_rev":            pulses_per_rev,
        "gear_ratio":                gear_ratio,
    }

    if lead_mm is not None:
        linear_resolution_um = (lead_mm / (pulses_per_rev * gear_ratio)) * 1000
        result["linear_resolution_um"] = round(linear_resolution_um, 4)
        result["linear_resolution_mm"] = round(linear_resolution_um / 1000, 6)

    return result
