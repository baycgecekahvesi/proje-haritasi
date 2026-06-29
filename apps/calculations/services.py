"""Hesaplama dispatcher — calc_type → engine fonksiyonu eşlemesi."""
from .engine import electric, electronic, automation

CALC_MAP = {
    # Elektrik
    "cable_section":          (electric, "cable_section", "electric"),
    "motor_current":          (electric, "motor_current", "electric"),
    "fuse_selection":         (electric, "fuse_selection", "electric"),
    "transformer_sizing":     (electric, "transformer_sizing", "electric"),
    "voltage_drop":           (electric, "voltage_drop", "electric"),
    "power_factor_correction":(electric, "power_factor_correction", "electric"),
    "short_circuit_current":  (electric, "short_circuit_current", "electric"),
    "lighting_calculation":   (electric, "lighting_calculation", "electric"),
    "grounding_resistance":   (electric, "grounding_resistance", "electric"),
    "ohms_law":               (electric, "ohms_law", "electric"),
    # Elektronik
    "resistor_divider":       (electronic, "resistor_divider", "electronic"),
    "rc_filter":              (electronic, "rc_filter", "electronic"),
    "rl_filter":              (electronic, "rl_filter", "electronic"),
    "led_resistor":           (electronic, "led_resistor", "electronic"),
    "capacitor_energy":       (electronic, "capacitor_energy", "electronic"),
    "series_parallel_resistor":(electronic,"series_parallel_resistor","electronic"),
    "zener_regulator":        (electronic, "zener_regulator", "electronic"),
    # Otomasyon
    "pneumatic_cylinder_force":(automation,"pneumatic_cylinder_force","automation"),
    "pneumatic_air_consumption":(automation,"pneumatic_air_consumption","automation"),
    "vfd_selection":          (automation, "vfd_selection", "automation"),
    "conveyor_capacity":      (automation, "conveyor_capacity", "automation"),
    "plc_io_count":           (automation, "plc_io_count", "automation"),
    "pid_tuning_ziegler_nichols":(automation,"pid_tuning_ziegler_nichols","automation"),
    "encoder_resolution":     (automation, "encoder_resolution", "automation"),
}


def run_calculation(calc_type: str, inputs: dict) -> dict:
    if calc_type not in CALC_MAP:
        from ninja.errors import HttpError
        raise HttpError(400, f"Bilinmeyen hesaplama türü: {calc_type}")

    module, func_name, category = CALC_MAP[calc_type]
    func = getattr(module, func_name)

    try:
        result = func(**inputs)
    except TypeError as e:
        from ninja.errors import HttpError
        raise HttpError(400, f"Hatalı giriş parametresi: {e}")

    warnings = result.pop("warnings", []) if isinstance(result, dict) else []
    return {
        "calc_type": calc_type,
        "category":  category,
        "inputs":    inputs,
        "result":    result,
        "warnings":  warnings,
    }


def list_calc_types() -> dict:
    """Tüm hesaplama türlerini kategori bazlı listele."""
    categories: dict[str, list] = {"electric": [], "electronic": [], "automation": []}
    for ct, (_, _, cat) in CALC_MAP.items():
        categories[cat].append(ct)
    return categories
