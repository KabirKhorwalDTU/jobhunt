#!/usr/bin/env python3
"""
Comprehensive Vedic Astrology Calculator
Computes: D1 (Rashi), D9 (Navamsa), D10 (Dasamsa), D7 (Saptamsa), D12 (Dwadasamsa), D60 (Shastiamsa)
Plus: Vimshottari Dasha (Maha + Antar), Yogas, Planetary Dignity, Lal Kitab framework

Usage:
    python vedic_calculator.py --date "YYYY-MM-DD" --time "HH:MM" --lat FLOAT --lon FLOAT [--tz FLOAT] [--city NAME]

Example:
    python vedic_calculator.py --date "2001-11-06" --time "11:05" --lat 28.6139 --lon 77.2090 --tz 5.5 --city "Delhi"
"""

import swisseph as swe
import math
import json
import argparse
from datetime import datetime, timedelta

# =============================================
# CONSTANTS
# =============================================
SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
SIGNS_HI = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
            "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"]
SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
              "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]
NAKSHATRA_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
]

DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
DASHA_YEARS = {"Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
               "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17}

EXALTATION = {"Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5, "Jupiter": 3, "Venus": 11, "Saturn": 6}
DEBILITATION = {"Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11, "Jupiter": 9, "Venus": 5, "Saturn": 0}
OWN_SIGNS = {
    "Sun": [4], "Moon": [3], "Mars": [0, 7], "Mercury": [2, 5],
    "Jupiter": [8, 11], "Venus": [1, 6], "Saturn": [9, 10]
}

PAKKA_GHAR = {"Sun": 1, "Moon": 4, "Mars": 3, "Mercury": 7, "Jupiter": 2, "Venus": 7, "Saturn": 8, "Rahu": 12, "Ketu": 6}

LK_GOOD_HOUSES = {
    "Sun": [1,3,4,10,11], "Moon": [1,2,3,4,7], "Mars": [1,2,3,4,10],
    "Mercury": [1,2,4,5,6,7], "Jupiter": [1,2,5,9,10,11], "Venus": [2,3,4,7,12],
    "Saturn": [2,3,7,10,11], "Rahu": [3,4,6], "Ketu": [3,6,9,12]
}
LK_BAD_HOUSES = {
    "Sun": [6,7,8,12], "Moon": [8,10,12], "Mars": [6,7,8,12],
    "Mercury": [3,8,9,12], "Jupiter": [3,6,8,12], "Venus": [1,6,8,9],
    "Saturn": [1,4,5,6,8,12], "Rahu": [1,2,5,7,8,9,10,11,12], "Ketu": [1,2,4,5,7,8,10,11]
}

D60_NAMES = [
    "Ghora", "Rakshasa", "Deva", "Kubera", "Yaksha", "Kinnara", "Bhrashta", "Kulaghna",
    "Garala", "Vahni", "Maya", "Purishaka", "Apampathi", "Marut", "Kaala", "Sarpa",
    "Amrita", "Indu", "Mridu", "Komala", "Heramba", "Brahma", "Vishnu", "Maheshwara",
    "Deva", "Ardra", "Kalinasa", "Kshiteesa", "Kamalakara", "Gulika", "Mrithyu", "Kaala",
    "Davagni", "Ghora", "Yama", "Kantaka", "Sudha", "Amrita", "Poornachandra", "Vishadagdha",
    "Kulanasa", "Vamshakshaya", "Utpata", "Kaala", "Saumya", "Komala", "Sheetala", "Karala",
    "Chandramukhi", "Praveena", "Kalapavaka", "Dandayudha", "Nirmala", "Saumya", "Kroora",
    "Atisheetala", "Amrita", "Payodhi", "Bhramana", "Chandrarekha"
]

D60_BENEFIC = {"Deva","Kubera","Yaksha","Kinnara","Amrita","Indu","Mridu","Komala","Brahma",
    "Vishnu","Maheshwara","Sudha","Poornachandra","Saumya","Sheetala","Chandramukhi",
    "Praveena","Nirmala","Payodhi","Chandrarekha","Heramba"}
D60_MALEFIC = {"Ghora","Rakshasa","Bhrashta","Kulaghna","Garala","Vahni","Maya","Kaala",
    "Sarpa","Mrithyu","Davagni","Yama","Kantaka","Vishadagdha","Kulanasa","Vamshakshaya",
    "Utpata","Karala","Kalapavaka","Dandayudha","Kroora","Bhramana"}


# =============================================
# HELPER FUNCTIONS
# =============================================
def sign_num(deg): return int(deg / 30)
def deg_in_sign(deg): return deg % 30
def deg_to_dms(deg):
    d = int(deg); m = int((deg - d) * 60); s = int(((deg - d) * 60 - m) * 60)
    return f"{d}°{m:02d}'{s:02d}\""

def get_nakshatra(deg):
    idx = int(deg / (360/27))
    pada = int((deg % (360/27)) / (360/108)) + 1
    return NAKSHATRAS[idx], pada, NAKSHATRA_LORDS[idx]


# =============================================
# DIVISIONAL CHART CALCULATORS
# =============================================
def calc_d9(lng):
    s = int(lng / 30); d = lng % 30; n = int(d / (30/9))
    starts = {0:0,1:9,2:6,3:3}
    return (starts[s % 4] + n) % 12

def calc_d10(lng):
    s = int(lng / 30); d = lng % 30; n = int(d / 3)
    start = s if s % 2 == 0 else (s + 9) % 12
    return (start + n) % 12

def calc_d7(lng):
    s = int(lng / 30); d = lng % 30; n = int(d / (30/7))
    start = s if s % 2 == 0 else (s + 6) % 12
    return (start + n) % 12

def calc_d12(lng):
    s = int(lng / 30); d = lng % 30; n = int(d / 2.5)
    return (s + n) % 12

def calc_d60(lng):
    s = int(lng / 30); d = lng % 30; n = int(d / 0.5)
    return (s + n) % 12, n


# =============================================
# DASHA CALCULATOR
# =============================================
def calculate_dashas(moon_lng, birth_dt):
    nak_idx = int(moon_lng / (360/27))
    start_lord = NAKSHATRA_LORDS[nak_idx]
    nak_start = nak_idx * (360/27)
    fraction_elapsed = (moon_lng - nak_start) / (360/27)
    remaining_frac = 1 - fraction_elapsed
    remaining_years = DASHA_YEARS[start_lord] * remaining_frac

    start_idx = DASHA_SEQUENCE.index(start_lord)
    current = birth_dt
    dashas = []

    end = current + timedelta(days=remaining_years * 365.25)
    dashas.append({"lord": start_lord, "start": current, "end": end, "years": remaining_years})
    current = end

    for i in range(1, 10):
        lord = DASHA_SEQUENCE[(start_idx + i) % 9]
        yrs = DASHA_YEARS[lord]
        end = current + timedelta(days=yrs * 365.25)
        dashas.append({"lord": lord, "start": current, "end": end, "years": yrs})
        current = end
        if current.year > 2100: break

    return dashas

def calculate_antardashas(maha_lord, maha_start, maha_years):
    antardashas = []
    start_idx = DASHA_SEQUENCE.index(maha_lord)
    current = maha_start
    for i in range(9):
        lord = DASHA_SEQUENCE[(start_idx + i) % 9]
        yrs = (maha_years * DASHA_YEARS[lord]) / 120
        end = current + timedelta(days=yrs * 365.25)
        antardashas.append({"lord": lord, "start": current, "end": end, "years": yrs})
        current = end
    return antardashas


# =============================================
# YOGA DETECTION
# =============================================
def detect_yogas(planet_data, lagna_sign):
    yogas = []
    moon_s = planet_data["Moon"]["sign_num"]
    jup_s = planet_data["Jupiter"]["sign_num"]
    sun_s = planet_data["Sun"]["sign_num"]
    merc_s = planet_data["Mercury"]["sign_num"]
    mars_h = planet_data["Mars"]["house"]
    kendras = [1, 4, 7, 10]

    # Gajakesari
    if (jup_s - moon_s) % 12 in [0, 3, 6, 9]:
        yogas.append({"name": "Gajakesari Yoga", "type": "benefic",
            "desc": "Jupiter in kendra from Moon — wisdom, fame, lasting reputation"})
    # Budhaditya
    if sun_s == merc_s:
        yogas.append({"name": "Budhaditya Yoga", "type": "benefic",
            "desc": "Sun-Mercury conjunction — intelligence, communication, analytical ability"})
    # Pancha Mahapurusha
    for p, exalt_signs, name, desc in [
        ("Jupiter", [8,11,3], "Hamsa", "righteous, learned, respected"),
        ("Venus", [1,6,11], "Malavya", "luxury, beauty, artistic talent"),
        ("Mars", [0,7,9], "Ruchaka", "courage, leadership, valor"),
        ("Saturn", [9,10,6], "Shasha", "authority, discipline, power"),
        ("Mercury", [2,5], "Bhadra", "intellect, eloquence, wealth")]:
        if planet_data[p]["house"] in kendras and planet_data[p]["sign_num"] in exalt_signs:
            yogas.append({"name": f"{name} Yoga", "type": "mahapurusha", "desc": desc})
    # Mangal Dosha
    if mars_h in [1, 2, 4, 7, 8, 12]:
        yogas.append({"name": "Mangal Dosha", "type": "dosha",
            "desc": f"Mars in House {mars_h} — impacts marriage compatibility"})
    # Guru Chandal
    if planet_data["Jupiter"]["sign_num"] == planet_data["Rahu"]["sign_num"]:
        yogas.append({"name": "Guru Chandal Dosh", "type": "dosha",
            "desc": "Jupiter-Rahu conjunction — wisdom clouded by illusion, misleading mentors"})
    # Kaal Sarp check
    rahu_lng = planet_data["Rahu"]["longitude"]
    ketu_lng = planet_data["Ketu"]["longitude"]
    all_between = True
    for p in ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"]:
        plng = planet_data[p]["longitude"]
        if rahu_lng < ketu_lng:
            between = rahu_lng <= plng <= ketu_lng
        else:
            between = plng >= rahu_lng or plng <= ketu_lng
        if not between: all_between = False; break
    if all_between:
        yogas.append({"name": "Kaal Sarp Yoga", "type": "dosha",
            "desc": "All planets between Rahu-Ketu axis — karmic challenges, eventual transformation"})

    return yogas


# =============================================
# NUMEROLOGY CALCULATIONS
# =============================================
NUMEROLOGY_PLANET_MAP = {
    1: "Sun", 2: "Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury",
    6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars",
    11: "Neptune/Higher Moon", 22: "Master Builder", 33: "Master Teacher"
}

def reduce_to_single(n):
    """Reduce number to single digit, keeping Master Numbers 11, 22, 33."""
    while n > 9:
        if n in (11, 22, 33):
            return n
        n = sum(int(d) for d in str(n))
    return n

def _force_reduce(n):
    """Force reduce to single digit, ignoring Master Numbers."""
    while n > 9:
        n = sum(int(d) for d in str(n))
    return n

def calc_life_path(day, month, year):
    """Calculate Life Path Number from birth date.
    Checks both reduction paths for Master Numbers:
    Path A keeps Master component digits, Path B force-reduces them.
    If either path yields a Master Number (11, 22, 33), that is used."""
    d = reduce_to_single(day)
    m_master = reduce_to_single(month)   # may be 11 if November
    m_reduced = _force_reduce(m_master)  # force 11->2
    y = reduce_to_single(sum(int(x) for x in str(year)))

    # Path A: keep master components as-is
    total_a = d + m_master + y
    result_a = reduce_to_single(total_a)

    # Path B: force-reduce master components first
    total_b = d + m_reduced + y
    result_b = reduce_to_single(total_b)

    # If either path yields a Master Number, prefer it
    if result_b in (11, 22, 33):
        return result_b
    if result_a in (11, 22, 33):
        return result_a
    return result_a

def calc_birth_day_number(day):
    """Calculate Birth Day Number (day reduced to single digit)."""
    return reduce_to_single(day)

def calc_personal_year(day, month, current_year):
    """Calculate Personal Year Number for a given year."""
    d = reduce_to_single(day)
    m = reduce_to_single(month)
    y = reduce_to_single(sum(int(x) for x in str(current_year)))
    return reduce_to_single(d + m + y)

PERSONAL_YEAR_THEMES = {
    1: "New beginnings, fresh starts, planting seeds",
    2: "Partnerships, patience, cooperation",
    3: "Creativity, expression, social expansion",
    4: "Foundation building, hard work, structure",
    5: "Change, freedom, adventure, travel",
    6: "Responsibility, family, home, love",
    7: "Reflection, spirituality, inner work",
    8: "Power, money, achievement, authority",
    9: "Completion, endings, clearing, letting go"
}

BIRTH_DAY_ENERGY = {
    1: "Leadership, independence, Sun energy",
    2: "Partnership, intuition, Moon energy",
    3: "Creativity, expression, Jupiter energy",
    4: "Structure, discipline, Rahu energy",
    5: "Freedom, change, Mercury energy",
    6: "Harmony, beauty, Venus energy",
    7: "Spirituality, analysis, Ketu energy",
    8: "Power, money, Saturn energy",
    9: "Completion, service, Mars energy"
}

def compute_numerology(day, month, year, current_year=None):
    """Compute complete numerology profile."""
    if current_year is None:
        current_year = datetime.now().year

    life_path = calc_life_path(day, month, year)
    birth_day = calc_birth_day_number(day)
    personal_year = calc_personal_year(day, month, current_year)
    next_year = calc_personal_year(day, month, current_year + 1)

    # Determine Vedic planet mapping
    lp_key = life_path if life_path in NUMEROLOGY_PLANET_MAP else (life_path % 10 if life_path > 9 else life_path)
    bd_key = birth_day if birth_day in NUMEROLOGY_PLANET_MAP else (birth_day % 10 if birth_day > 9 else birth_day)

    return {
        "life_path": {
            "number": life_path,
            "is_master": life_path in (11, 22, 33),
            "reduced": _force_reduce(life_path) if life_path in (11, 22, 33) else life_path,
            "vedic_planet": NUMEROLOGY_PLANET_MAP.get(life_path, NUMEROLOGY_PLANET_MAP.get(lp_key, "Unknown")),
            "description": f"Master Number {life_path}/{_force_reduce(life_path)}" if life_path in (11, 22, 33) else f"Life Path {life_path}"
        },
        "birth_day": {
            "number": birth_day,
            "original_day": day,
            "vedic_planet": NUMEROLOGY_PLANET_MAP.get(bd_key, "Unknown"),
            "energy": BIRTH_DAY_ENERGY.get(birth_day, "Unknown")
        },
        "personal_year": {
            "year": current_year,
            "number": personal_year,
            "theme": PERSONAL_YEAR_THEMES.get(personal_year, "Unknown")
        },
        "next_personal_year": {
            "year": current_year + 1,
            "number": next_year,
            "theme": PERSONAL_YEAR_THEMES.get(next_year, "Unknown")
        },
        "vedic_cross_reference": {
            "life_path_planet": NUMEROLOGY_PLANET_MAP.get(life_path, NUMEROLOGY_PLANET_MAP.get(lp_key, "Unknown")),
            "birth_day_planet": NUMEROLOGY_PLANET_MAP.get(bd_key, "Unknown"),
            "note": "Compare these planetary energies with the Vedic chart's Lagna lord and strongest planets for confirmations or tensions"
        }
    }


# =============================================
# MAIN CALCULATION
# =============================================
def compute_chart(birth_date_str, birth_time_str, lat, lon, tz_offset, city=""):
    # Parse inputs
    date_parts = birth_date_str.split("-")
    time_parts = birth_time_str.split(":")
    birth_dt = datetime(int(date_parts[0]), int(date_parts[1]), int(date_parts[2]),
                        int(time_parts[0]), int(time_parts[1]))
    utc_time = birth_dt - timedelta(hours=tz_offset)

    jd = swe.julday(utc_time.year, utc_time.month, utc_time.day,
                    utc_time.hour + utc_time.minute/60.0)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa(jd)

    # Ascendant
    cusps, ascmc = swe.houses(jd, lat, lon, b'P')
    asc_sid = (ascmc[0] - ayanamsa) % 360
    lagna_sign = sign_num(asc_sid)
    lagna_nak, lagna_pada, lagna_nak_lord = get_nakshatra(asc_sid)

    # Planets
    planet_ids = {swe.SUN: "Sun", swe.MOON: "Moon", swe.MARS: "Mars",
                  swe.MERCURY: "Mercury", swe.JUPITER: "Jupiter",
                  swe.VENUS: "Venus", swe.SATURN: "Saturn"}

    planet_data = {}
    for pid, pname in planet_ids.items():
        pos = swe.calc_ut(jd, pid, swe.FLG_SIDEREAL)
        lng = pos[0][0]; spd = pos[0][3]
        s = sign_num(lng); h = ((s - lagna_sign) % 12) + 1
        nak, pada, nak_lord = get_nakshatra(lng)
        dignity = "neutral"
        if s == EXALTATION.get(pname, -1): dignity = "exalted"
        elif s == DEBILITATION.get(pname, -1): dignity = "debilitated"
        elif s in OWN_SIGNS.get(pname, []): dignity = "own_sign"

        # Lordships
        lordships = []
        for i, lord in enumerate(SIGN_LORDS):
            if lord == pname:
                lordships.append(((i - lagna_sign) % 12) + 1)

        planet_data[pname] = {
            "longitude": lng, "sign": SIGNS[s], "sign_hi": SIGNS_HI[s], "sign_num": s,
            "deg_in_sign": deg_in_sign(lng), "deg_dms": deg_to_dms(lng),
            "house": h, "nakshatra": nak, "pada": pada, "nak_lord": nak_lord,
            "retrograde": spd < 0, "dignity": dignity, "lordships": lordships,
            # Divisional charts
            "d9_sign": calc_d9(lng), "d10_sign": calc_d10(lng),
            "d7_sign": calc_d7(lng), "d12_sign": calc_d12(lng),
        }
        d60_sign, d60_num = calc_d60(lng)
        d60_name = D60_NAMES[d60_num % 60]
        planet_data[pname]["d60_sign"] = d60_sign
        planet_data[pname]["d60_num"] = d60_num
        planet_data[pname]["d60_name"] = d60_name
        planet_data[pname]["d60_nature"] = "benefic" if d60_name in D60_BENEFIC else ("malefic" if d60_name in D60_MALEFIC else "neutral")
        planet_data[pname]["vargottama"] = (s == calc_d9(lng))

    # Rahu & Ketu
    pos_rahu = swe.calc_ut(jd, swe.MEAN_NODE, swe.FLG_SIDEREAL)
    rahu_lng = pos_rahu[0][0]; ketu_lng = (rahu_lng + 180) % 360
    for name, lng in [("Rahu", rahu_lng), ("Ketu", ketu_lng)]:
        s = sign_num(lng); h = ((s - lagna_sign) % 12) + 1
        nak, pada, nak_lord = get_nakshatra(lng)
        planet_data[name] = {
            "longitude": lng, "sign": SIGNS[s], "sign_hi": SIGNS_HI[s], "sign_num": s,
            "deg_in_sign": deg_in_sign(lng), "deg_dms": deg_to_dms(lng),
            "house": h, "nakshatra": nak, "pada": pada, "nak_lord": nak_lord,
            "retrograde": True, "dignity": "shadow", "lordships": [],
            "d9_sign": calc_d9(lng), "d10_sign": calc_d10(lng),
            "d7_sign": calc_d7(lng), "d12_sign": calc_d12(lng),
            "vargottama": (s == calc_d9(lng)),
        }
        d60_sign, d60_num = calc_d60(lng)
        d60_name = D60_NAMES[d60_num % 60]
        planet_data[name]["d60_sign"] = d60_sign
        planet_data[name]["d60_name"] = d60_name
        planet_data[name]["d60_nature"] = "benefic" if d60_name in D60_BENEFIC else ("malefic" if d60_name in D60_MALEFIC else "neutral")

    # Divisional chart lagnas
    d9_lagna = calc_d9(asc_sid)
    d10_lagna = calc_d10(asc_sid)
    d7_lagna = calc_d7(asc_sid)
    d12_lagna = calc_d12(asc_sid)
    d60_lagna_sign, d60_lagna_num = calc_d60(asc_sid)

    # Add divisional house placements
    for pname, pd in planet_data.items():
        pd["d9_house"] = ((pd["d9_sign"] - d9_lagna) % 12) + 1
        pd["d10_house"] = ((pd["d10_sign"] - d10_lagna) % 12) + 1
        pd["d7_house"] = ((pd["d7_sign"] - d7_lagna) % 12) + 1
        pd["d12_house"] = ((pd["d12_sign"] - d12_lagna) % 12) + 1
        pd["d60_house"] = ((pd.get("d60_sign", 0) - d60_lagna_sign) % 12) + 1

    # Dashas
    moon_lng = planet_data["Moon"]["longitude"]
    dashas = calculate_dashas(moon_lng, birth_dt)
    dasha_detail = []
    for d in dashas:
        antars = calculate_antardashas(d["lord"], d["start"], d["years"])
        dasha_detail.append({
            "lord": d["lord"],
            "start": d["start"].strftime("%Y-%m-%d"),
            "end": d["end"].strftime("%Y-%m-%d"),
            "years": round(d["years"], 2),
            "age_start": round((d["start"] - birth_dt).days / 365.25, 1),
            "age_end": round((d["end"] - birth_dt).days / 365.25, 1),
            "antardashas": [{"lord": a["lord"],
                             "start": a["start"].strftime("%Y-%m-%d"),
                             "end": a["end"].strftime("%Y-%m-%d"),
                             "years": round(a["years"], 2),
                             "age_start": round((a["start"] - birth_dt).days / 365.25, 1),
                             "age_end": round((a["end"] - birth_dt).days / 365.25, 1)}
                            for a in antars]
        })

    # Yogas
    yogas = detect_yogas(planet_data, lagna_sign)

    # Lal Kitab analysis
    lk_analysis = {}
    for pname in planet_data:
        h = planet_data[pname]["house"]
        pg = PAKKA_GHAR.get(pname)
        good = LK_GOOD_HOUSES.get(pname, [])
        bad = LK_BAD_HOUSES.get(pname, [])
        state = "favorable" if h in good else ("unfavorable" if h in bad else "neutral")
        lk_analysis[pname] = {
            "house": h,
            "pakka_ghar": pg,
            "in_pakka_ghar": h == pg if pg else False,
            "state": state
        }

    # Key house lords
    def house_lord(house_num):
        sign_idx = (lagna_sign + house_num - 1) % 12
        return SIGN_LORDS[sign_idx]

    # Compile output
    result = {
        "meta": {
            "birth_date": birth_date_str, "birth_time": birth_time_str,
            "latitude": lat, "longitude": lon, "timezone": tz_offset,
            "city": city, "ayanamsa": round(ayanamsa, 4), "ayanamsa_type": "Lahiri",
            "julian_day": jd, "house_system": "Whole Sign"
        },
        "lagna": {
            "sign": SIGNS[lagna_sign], "sign_hi": SIGNS_HI[lagna_sign],
            "sign_num": lagna_sign, "degree": round(asc_sid, 4),
            "deg_in_sign": round(deg_in_sign(asc_sid), 4),
            "deg_dms": deg_to_dms(deg_in_sign(asc_sid)),
            "nakshatra": lagna_nak, "pada": lagna_pada, "nak_lord": lagna_nak_lord,
            "lord": SIGN_LORDS[lagna_sign],
            "lord_house": planet_data[SIGN_LORDS[lagna_sign]]["house"]
        },
        "divisional_lagnas": {
            "d1": {"sign": SIGNS[lagna_sign], "lord": SIGN_LORDS[lagna_sign]},
            "d9": {"sign": SIGNS[d9_lagna], "lord": SIGN_LORDS[d9_lagna]},
            "d10": {"sign": SIGNS[d10_lagna], "lord": SIGN_LORDS[d10_lagna]},
            "d7": {"sign": SIGNS[d7_lagna], "lord": SIGN_LORDS[d7_lagna]},
            "d12": {"sign": SIGNS[d12_lagna], "lord": SIGN_LORDS[d12_lagna]},
            "d60": {"sign": SIGNS[d60_lagna_sign], "division": D60_NAMES[d60_lagna_num % 60]},
        },
        "planets": {},
        "houses": {},
        "key_lords": {
            "1st (Self)": house_lord(1), "2nd (Wealth)": house_lord(2),
            "4th (Home)": house_lord(4), "5th (Children)": house_lord(5),
            "7th (Marriage)": house_lord(7), "9th (Fortune)": house_lord(9),
            "10th (Career)": house_lord(10), "11th (Gains)": house_lord(11),
            "12th (Loss)": house_lord(12),
        },
        "dashas": dasha_detail,
        "yogas": [{"name": y["name"], "type": y["type"], "description": y["desc"]} for y in yogas],
        "lal_kitab": lk_analysis,
        "sade_sati": {
            "moon_sign": SIGNS[planet_data["Moon"]["sign_num"]],
            "note": "Sade Sati occurs when Saturn transits the 12th, 1st, and 2nd signs from Moon sign. Calculate based on current Saturn transit."
        },
        "numerology": compute_numerology(
            int(date_parts[2]),  # day
            int(date_parts[1]),  # month
            int(date_parts[0])   # year
        )
    }

    # Clean planet data for JSON
    for pname, pd in planet_data.items():
        result["planets"][pname] = {
            "longitude": round(pd["longitude"], 4),
            "sign": pd["sign"], "sign_hi": pd["sign_hi"],
            "sign_num": pd["sign_num"],
            "deg_in_sign": round(pd["deg_in_sign"], 4),
            "deg_dms": pd["deg_dms"],
            "house": pd["house"],
            "nakshatra": pd["nakshatra"], "pada": pd["pada"], "nak_lord": pd["nak_lord"],
            "retrograde": pd["retrograde"], "dignity": pd["dignity"],
            "lordships": pd["lordships"],
            "vargottama": pd["vargottama"],
            "d9": {"sign": SIGNS[pd["d9_sign"]], "house": pd["d9_house"]},
            "d10": {"sign": SIGNS[pd["d10_sign"]], "house": pd["d10_house"]},
            "d7": {"sign": SIGNS[pd["d7_sign"]], "house": pd["d7_house"]},
            "d12": {"sign": SIGNS[pd["d12_sign"]], "house": pd["d12_house"]},
            "d60": {"sign": SIGNS[pd.get("d60_sign", 0)], "house": pd.get("d60_house", 0),
                    "name": pd.get("d60_name", ""), "nature": pd.get("d60_nature", "")},
        }

    # House occupancy
    for h in range(1, 13):
        sign_idx = (lagna_sign + h - 1) % 12
        tenants = [p for p, d in planet_data.items() if d["house"] == h]
        result["houses"][str(h)] = {
            "sign": SIGNS[sign_idx], "lord": SIGN_LORDS[sign_idx],
            "planets": tenants
        }

    return result


# =============================================
# PRETTY PRINTER
# =============================================
def print_chart(data):
    m = data["meta"]
    print(f"{'='*80}")
    print(f"VEDIC BIRTH CHART — {m['city'] or 'Unknown'}")
    print(f"Born: {m['birth_date']} at {m['birth_time']} (UTC{'+' if m['timezone']>=0 else ''}{m['timezone']})")
    print(f"Coordinates: {m['latitude']}°N, {m['longitude']}°E")
    print(f"Ayanamsa: {m['ayanamsa']}° ({m['ayanamsa_type']})")
    print(f"{'='*80}")

    l = data["lagna"]
    print(f"\nLAGNA: {l['sign']} ({l['sign_hi']}) at {l['deg_dms']}")
    print(f"  Nakshatra: {l['nakshatra']} Pada {l['pada']} (Lord: {l['nak_lord']})")
    print(f"  Lagna Lord: {l['lord']} in House {l['lord_house']}")

    print(f"\n{'Planet':<12} {'Sign':<14} {'House':<6} {'Degree':<14} {'Nakshatra':<18} {'Dignity':<12} {'Vargottama'}")
    print("-" * 95)
    for pname, pd in data["planets"].items():
        varg = "★" if pd.get("vargottama") else ""
        retro = " (R)" if pd["retrograde"] else ""
        print(f"{pname:<12} {pd['sign']:<14} H{pd['house']:<4} {pd['deg_dms']:<14} {pd['nakshatra']:<18} {pd['dignity']:<12} {varg}{retro}")

    print(f"\n{'='*60}")
    print("HOUSE OCCUPANCY")
    print(f"{'='*60}")
    for h in range(1, 13):
        hd = data["houses"][str(h)]
        planets = ", ".join(hd["planets"]) if hd["planets"] else "Empty"
        print(f"  H{h:2d} ({hd['sign']:<13} / {hd['lord']:<8}): {planets}")

    print(f"\n{'='*60}")
    print("YOGAS & SPECIAL COMBINATIONS")
    print(f"{'='*60}")
    for y in data["yogas"]:
        marker = "✓" if y["type"] in ["benefic", "mahapurusha"] else "⚠"
        print(f"  {marker} {y['name']}: {y['description']}")

    print(f"\n{'='*60}")
    print("DIVISIONAL CHART LAGNAS")
    print(f"{'='*60}")
    for chart, info in data["divisional_lagnas"].items():
        print(f"  {chart.upper()}: {info['sign']} (Lord: {info.get('lord', info.get('division', ''))})")

    # Print divisional chart summary for each planet
    print(f"\n{'='*60}")
    print("DIVISIONAL CHART POSITIONS")
    print(f"{'='*60}")
    print(f"{'Planet':<12} {'D9':<14} {'D10':<14} {'D7':<14} {'D12':<14} {'D60'}")
    print("-" * 80)
    for pname, pd in data["planets"].items():
        d60_info = f"{pd['d60']['sign']} ({pd['d60'].get('name','')})"
        print(f"{pname:<12} {pd['d9']['sign']:<14} {pd['d10']['sign']:<14} {pd['d7']['sign']:<14} {pd['d12']['sign']:<14} {d60_info}")

    print(f"\n{'='*60}")
    print("VIMSHOTTARI DASHA TIMELINE")
    print(f"{'='*60}")
    now = datetime.now()
    for d in data["dashas"]:
        marker = " ★ CURRENT" if d["start"] <= now.strftime("%Y-%m-%d") <= d["end"] else ""
        print(f"\n  {d['lord']} MAHADASHA: {d['start']} to {d['end']} (Age {d['age_start']}-{d['age_end']}){marker}")
        for a in d["antardashas"]:
            am = " ◄ NOW" if a["start"] <= now.strftime("%Y-%m-%d") <= a["end"] else ""
            print(f"    {d['lord']}-{a['lord']:<8} {a['start']} to {a['end']}  ({a['years']:.1f} yrs, Age {a['age_start']:.0f}-{a['age_end']:.0f}){am}")

    print(f"\n{'='*60}")
    print("LAL KITAB — PAKKA GHAR ANALYSIS")
    print(f"{'='*60}")
    for pname, lk in data["lal_kitab"].items():
        pg_str = f"Pakka: H{lk['pakka_ghar']}" if lk["pakka_ghar"] else ""
        in_pg = " ★ IN PAKKA GHAR" if lk["in_pakka_ghar"] else ""
        state_marker = {"favorable": "✓", "unfavorable": "⚠", "neutral": "~"}
        print(f"  {pname:<12} H{lk['house']:<4} {state_marker.get(lk['state'],'?')} {lk['state']:<12} {pg_str}{in_pg}")

    print(f"\n{'='*60}")
    print("KEY HOUSE LORDS")
    print(f"{'='*60}")
    for desc, lord in data["key_lords"].items():
        lord_data = data["planets"].get(lord, {})
        print(f"  {desc}: {lord} in H{lord_data.get('house','?')} ({lord_data.get('sign','?')})")

    if "numerology" in data:
        n = data["numerology"]
        print(f"\n{'='*60}")
        print("NUMEROLOGY PROFILE")
        print(f"{'='*60}")
        lp = n["life_path"]
        bd = n["birth_day"]
        py = n["personal_year"]
        npy = n["next_personal_year"]
        master = f" (MASTER NUMBER {lp['number']}/{lp['reduced']})" if lp["is_master"] else ""
        print(f"  Life Path Number: {lp['number']}{master} — Vedic Planet: {lp['vedic_planet']}")
        print(f"  Birth Day Number: {bd['number']} (born on {bd['original_day']}) — {bd['energy']}")
        print(f"  Personal Year {py['year']}: {py['number']} — {py['theme']}")
        print(f"  Personal Year {npy['year']}: {npy['number']} — {npy['theme']}")
        print(f"  Cross-Reference: Life Path → {n['vedic_cross_reference']['life_path_planet']}, Birth Day → {n['vedic_cross_reference']['birth_day_planet']}")


# =============================================
# CLI
# =============================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Vedic Astrology Calculator")
    parser.add_argument("--date", required=True, help="Birth date YYYY-MM-DD")
    parser.add_argument("--time", required=True, help="Birth time HH:MM (24hr)")
    parser.add_argument("--lat", type=float, required=True, help="Latitude")
    parser.add_argument("--lon", type=float, required=True, help="Longitude")
    parser.add_argument("--tz", type=float, default=5.5, help="Timezone offset from UTC (default 5.5 for IST)")
    parser.add_argument("--city", default="", help="City name (for display)")
    parser.add_argument("--json", action="store_true", help="Output as JSON instead of pretty-print")
    parser.add_argument("--numerology", action="store_true", help="Include numerology calculations (Life Path, Birth Day, Personal Year)")
    args = parser.parse_args()

    result = compute_chart(args.date, args.time, args.lat, args.lon, args.tz, args.city)

    if args.json:
        print(json.dumps(result, indent=2, default=str))
    else:
        print_chart(result)
