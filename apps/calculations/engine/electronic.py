"""Elektronik hesaplama motoru."""
from __future__ import annotations
import math


def resistor_divider(
    vin: float,
    r1_ohm: float,
    r2_ohm: float,
) -> dict:
    """Gerilim bölücü devre hesabı."""
    vout = vin * r2_ohm / (r1_ohm + r2_ohm)
    i_ma = vin / (r1_ohm + r2_ohm) * 1000
    p1_mw = (i_ma / 1000) ** 2 * r1_ohm * 1000
    p2_mw = (i_ma / 1000) ** 2 * r2_ohm * 1000

    return {
        "output_voltage_v":  round(vout, 4),
        "current_ma":        round(i_ma, 4),
        "power_r1_mw":       round(p1_mw, 4),
        "power_r2_mw":       round(p2_mw, 4),
        "divider_ratio":     round(vout / vin, 4) if vin else 0,
    }


def rc_filter(
    resistance_ohm: float,
    capacitance_uf: float,
    filter_type: str = "lowpass",  # "lowpass" / "highpass"
) -> dict:
    """RC filtre kesme frekansı hesabı."""
    c_f = capacitance_uf * 1e-6
    fc = 1 / (2 * math.pi * resistance_ohm * c_f)
    tau = resistance_ohm * c_f * 1000  # ms cinsinden

    return {
        "cutoff_frequency_hz":   round(fc, 2),
        "time_constant_ms":      round(tau, 4),
        "angular_frequency_rad": round(2 * math.pi * fc, 2),
        "filter_type":           filter_type,
        "attenuation_at_fc_db":  -3.01,
    }


def rl_filter(
    resistance_ohm: float,
    inductance_mh: float,
) -> dict:
    """RL filtre kesme frekansı."""
    l_h = inductance_mh * 1e-3
    fc = resistance_ohm / (2 * math.pi * l_h)
    tau = l_h / resistance_ohm * 1000  # ms

    return {
        "cutoff_frequency_hz": round(fc, 2),
        "time_constant_ms":    round(tau, 4),
        "quality_factor_q":    round(2 * math.pi * fc * l_h / resistance_ohm, 4),
    }


def led_resistor(
    supply_v: float,
    led_forward_v: float = 2.0,
    led_current_ma: float = 20.0,
) -> dict:
    """LED seri direnç hesabı."""
    r_exact = (supply_v - led_forward_v) / (led_current_ma / 1000)
    p_mw = ((supply_v - led_forward_v) ** 2 / r_exact) * 1000

    # E24 serisi standart direnç değerleri
    e24 = [1.0,1.1,1.2,1.3,1.5,1.6,1.8,2.0,2.2,2.4,2.7,3.0,3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1]
    magnitudes = [1, 10, 100, 1000, 10000, 100000]
    standard = []
    for mag in magnitudes:
        for e in e24:
            standard.append(round(e * mag, 1))
    standard.sort()
    nearest = min(standard, key=lambda x: abs(x - r_exact))

    actual_current = (supply_v - led_forward_v) / nearest * 1000 if nearest > 0 else 0

    return {
        "exact_resistance_ohm":    round(r_exact, 1),
        "standard_resistance_ohm": nearest,
        "actual_current_ma":       round(actual_current, 2),
        "power_dissipation_mw":    round(p_mw, 1),
        "recommended_wattage":     0.25 if p_mw < 250 else (0.5 if p_mw < 500 else 1.0),
    }


def capacitor_energy(
    capacitance_uf: float,
    voltage_v: float,
) -> dict:
    """Kondansatör enerji ve şarj hesabı."""
    c = capacitance_uf * 1e-6
    energy_j = 0.5 * c * voltage_v ** 2
    charge_uc = c * voltage_v * 1e6

    return {
        "energy_joules": round(energy_j, 6),
        "charge_microcoulombs": round(charge_uc, 4),
        "capacitance_uf": capacitance_uf,
        "voltage_v": voltage_v,
    }


def series_parallel_resistor(
    resistors: list,
    connection: str = "series",  # "series" / "parallel"
) -> dict:
    """Seri/paralel direnç hesabı."""
    if not resistors:
        return {"error": "Direnç listesi boş"}

    if connection == "series":
        total = sum(resistors)
    else:
        total = 1 / sum(1 / r for r in resistors if r > 0)

    return {
        "total_resistance_ohm": round(total, 4),
        "connection_type": connection,
        "resistor_count": len(resistors),
    }


def zener_regulator(
    vin_min: float,
    vin_max: float,
    vout: float,
    i_load_max_ma: float,
    i_zener_min_ma: float = 5.0,
) -> dict:
    """Zener regülatör direnç hesabı."""
    i_total_max = i_load_max_ma + i_zener_min_ma  # mA
    r_min = (vin_min - vout) / (i_total_max / 1000)
    r_max = (vin_max - vout) / (i_zener_min_ma / 1000) if i_zener_min_ma > 0 else float('inf')

    r_series = min(r_min, r_max)
    p_max_w = ((vin_max - vout) ** 2) / r_series if r_series > 0 else 0
    p_zener_max_w = vout * (vin_max - vout) / r_series if r_series > 0 else 0

    return {
        "series_resistance_ohm":     round(r_series, 1),
        "max_power_resistor_w":      round(p_max_w, 3),
        "max_power_zener_w":         round(p_zener_max_w, 3),
        "recommended_resistor_w":    0.5 if p_max_w < 0.5 else (1.0 if p_max_w < 1.0 else 2.0),
    }
