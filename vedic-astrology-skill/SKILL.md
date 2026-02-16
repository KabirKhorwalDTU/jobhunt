---
name: vedic-astrology
description: >
  Comprehensive Vedic (Sidereal) astrology birth chart analysis covering D1 Rashi, D9 Navamsa, D10 Dasamsa,
  D7 Saptamsa, D12 Dwadasamsa, D60 Shastiamsa charts, Vimshottari Dasha timelines, Yoga detection,
  complete Lal Kitab analysis, and Numerology (Life Path, Birth Day, Personal Year cycles).
  Produces deeply specific life readings across career, marriage, love, health, finance, family, longevity,
  soul-purpose, and karmic patterns — with exact age timelines and actionable remedies.
  Also supports Life-Decode analysis types: Life-Path Decoder, Soul-Purpose Guide, Career Destiny,
  Love & Relationship Compatibility, Wealth & Abundance Strategy, and Life Time-Map.
  Use this skill whenever someone asks for a birth chart reading, Kundli analysis, Vedic astrology, Jyotish,
  horoscope interpretation, Lal Kitab remedies, Dasha predictions, Varga chart analysis, marriage timing,
  career astrology, numerology, life path, soul purpose, or any natal chart question. Also trigger when
  someone provides birth details (date, time, place) and wants life predictions or astrological guidance.
---

# Vedic Astrology — Comprehensive Birth Chart Analysis

## Overview

This skill enables Claude to compute and interpret full Vedic astrological charts from birth data.
It combines mathematical astronomy (Swiss Ephemeris via pyswisseph) with deep interpretive frameworks
across Parashari Jyotish, Divisional Charts, Lal Kitab traditions, and Numerology. The output matches
the quality of a seasoned Jyotishi — specific, timeline-bound, unflinching about negatives, and rich
with remedies. It also supports specialized "Life-Decode" analysis types that synthesize Vedic chart
data with numerological calculations for targeted life-domain readings.

## Workflow

### Phase 1: Collect Birth Data

Get these four pieces of information. All are required:

1. **Date of birth** — exact date in YYYY-MM-DD format
2. **Time of birth** — as precise as possible in HH:MM 24-hour format (even 5-minute differences shift the Lagna)
3. **Place of birth** — city name for display; resolve to latitude/longitude
4. **Timezone** — offset from UTC (e.g., IST = +5.5, EST = -5.0)

For latitude/longitude lookup, use common city coordinates:
- Delhi: 28.6139, 77.2090
- Mumbai: 19.0760, 72.8777
- Bangalore: 12.9716, 77.5946
- Chennai: 13.0827, 80.2707
- Kolkata: 22.5726, 88.3639
- New York: 40.7128, -74.0060
- London: 51.5074, -0.1278
- For other cities: use web search or ask the user

### Phase 2: Compute the Chart

Run the calculator script:

```bash
# First install dependencies
bash scripts/install_deps.sh

# Then compute the chart
python scripts/vedic_calculator.py \
  --date "YYYY-MM-DD" \
  --time "HH:MM" \
  --lat LATITUDE \
  --lon LONGITUDE \
  --tz TIMEZONE_OFFSET \
  --city "CITY_NAME" \
  --json
```

The `--json` flag gives structured output. Without it, you get a pretty-printed summary.
Use JSON for full analysis; use pretty-print for quick verification.

The script outputs:
- **meta**: Birth data, ayanamsa, house system
- **lagna**: Ascendant sign, degree, nakshatra, lord placement
- **divisional_lagnas**: Lagna positions for D1, D9, D10, D7, D12, D60
- **planets**: Each planet's sign, house, nakshatra, dignity, retrograde status, and positions across all 6 divisional charts
- **houses**: Which planets occupy each house
- **key_lords**: Lords of critical houses (1st, 2nd, 4th, 5th, 7th, 9th, 10th, 11th, 12th)
- **dashas**: Full Vimshottari Dasha timeline with Antardasha sub-periods, dates, and ages
- **yogas**: Detected special combinations (Gajakesari, Budhaditya, Pancha Mahapurusha, Mangal Dosha, Guru Chandal, Kaal Sarp)
- **lal_kitab**: Pakka Ghar analysis and favorable/unfavorable state per planet
- **numerology**: Life Path Number, Birth Day Number, Personal Year (with Master Number detection)

### Phase 3: Interpret the Chart

This is where the real work happens. The calculator gives you raw positions; interpretation requires synthesizing across multiple systems. Read the appropriate reference files before writing:

- `references/interpretation-framework.md` — Master interpretation logic, house-by-house, planet-by-planet
- `references/lal-kitab-guide.md` — Lal Kitab philosophy, Rin system, planetary age triggers, remedies (Totke)
- `references/life-domain-analysis.md` — How to analyze each life domain (career, love, health, wealth, family, longevity)
- `references/numerology-life-decode.md` — Numerology calculations (Life Path, Birth Day, Personal Year), Vedic-Numerology cross-reference, and 6 Life-Decode analysis frameworks (Life-Path Decoder, Soul-Purpose Guide, Career Destiny, Love & Relationships, Wealth & Abundance, Life Time-Map)

### Phase 4: Write the Reading

Structure the reading as a comprehensive document. The tone should be direct, specific, and unflinching.
Give exact ages and timelines wherever Dasha periods allow. Never hide bad news — but always pair negatives with remedies.

## Interpretation Principles

These principles govern how to translate chart data into life predictions:

### 1. The Hierarchy of Evidence

When making predictions, weight evidence in this order:
1. **Mahadasha lord's strength and placement** — This is the macro weather of your life
2. **House lord placement + dignity** — Where the ruler of a life area actually sits
3. **Planets in the house** — Direct occupants flavor the house
4. **Aspects to house and lord** — Modifiers that amplify or suppress
5. **Divisional chart confirmation** — D9 for marriage, D10 for career, etc.
6. **Lal Kitab layer** — Pakka Ghar, sleeping/blind planets, Rin patterns
7. **Yoga participation** — Special combinations that elevate or challenge

### 2. The Dasha-Transit Principle

Nothing happens without a Dasha trigger. A promise in the birth chart only manifests when:
- The relevant planet's Mahadasha or Antardasha is active
- The planet rules or aspects the relevant house

So if someone asks "when will I get married?", find:
1. 7th house lord — where is it, what condition?
2. Venus (karaka for marriage) — where, what dignity?
3. Which Dasha periods activate these planets?
4. Cross-check D9 Navamsa for marriage-specific confirmation

### 3. The "Three Chart Rule"

For any life question, check at minimum:
- **D1 (Rashi)**: The baseline promise
- **The relevant Varga chart**: D9 for marriage, D10 for career, D7 for children, D12 for parents
- **Lal Kitab**: For remedy direction and karmic debt identification

If all three agree, the prediction is strong. If they conflict, note the tension and give probability ranges.

### 4. Dignity Weights

Planet dignity dramatically affects interpretation:
- **Exalted**: Planet delivers its best results, often exceeding expectations
- **Own sign**: Strong, reliable delivery — like being in your own home
- **Vargottama** (same sign in D1 and D9): Doubles the planet's power for good or bad
- **Neutral**: Average results, dependent on house and aspects
- **Debilitated**: Planet struggles to deliver; results come late, with effort, or through unconventional paths
- **Retrograde**: Internalized energy; delays but also depth; re-doing karmic lessons

### 5. House Significations

| House | Life Area | Karaka (Significator) |
|-------|-----------|----------------------|
| 1st | Self, body, personality, vitality | Sun |
| 2nd | Wealth, family, speech, food | Jupiter |
| 3rd | Siblings, courage, communication, short travel | Mars |
| 4th | Mother, home, vehicles, education, inner peace | Moon |
| 5th | Children, intelligence, romance, past-life credit | Jupiter |
| 6th | Enemies, disease, debt, competition, service | Mars, Saturn |
| 7th | Marriage, partnerships, business, public dealings | Venus |
| 8th | Longevity, transformation, inheritance, occult, sudden events | Saturn |
| 9th | Father, fortune, dharma, higher education, long travel | Jupiter, Sun |
| 10th | Career, karma, status, authority, public image | Sun, Saturn, Mercury |
| 11th | Gains, income, elder siblings, fulfillment of desires, networks | Jupiter |
| 12th | Loss, foreign lands, expenses, isolation, moksha, bed pleasures | Saturn, Ketu |

### 6. Numerology Integration

Numerology adds a parallel number-based system that synthesizes with the Vedic chart:

- **Life Path Number**: Calculated from the full birth date (reduce Day + Month + Year, preserving Master Numbers 11, 22, 33). Maps to a Vedic planet: 1=Sun, 2=Moon, 3=Jupiter, 4=Rahu, 5=Mercury, 6=Venus, 7=Ketu, 8=Saturn, 9=Mars, 11=Higher Moon/Neptune.
- **Birth Day Number**: The day of birth reduced to single digit. Reveals innate talents and maps to a planetary energy.
- **Personal Year Number**: Birth Day + Birth Month + Current Year (reduced). Reveals the year's theme on a 9-year cycle.

**Vedic-Numerology Cross-Reference:**
- Life Path matches Lagna lord energy? = strong alignment, living authentically
- Life Path conflicts with Lagna? = internal tension between who they feel they should be vs. how they act
- Birth Day Number matches strongest planet? = innate talents clearly expressed
- Personal Year matches current Dasha energy? = year flows smoothly
- Personal Year conflicts with Dasha? = mixed results, requires conscious navigation

The `vedic_calculator.py` script includes `--numerology` flag to compute these automatically. The full framework is in `references/numerology-life-decode.md`.

### 7. Lal Kitab Integration

Lal Kitab adds a parallel folk-astrology layer. Key concepts:
- **Pakka Ghar**: Each planet has a "permanent home" house. A planet in its Pakka Ghar is powerful regardless of Vedic dignity.
- **Sleeping planets**: Planets that give no results (good or bad) due to specific configurations
- **Blind planets**: Planets whose significations are blocked
- **Rin (Debt)**: Karmic debts from past lives that must be repaid — identified by specific planet-house combos
- **Teva Chart**: The Lal Kitab birth chart uses a different calculation philosophy
- **Totke (Remedies)**: Simple folk remedies — feeding animals, wearing metals, charity on specific days

Always cross-reference Lal Kitab findings with the Vedic chart. Where they agree, confidence is high.

### 8. Timing Framework

All timeline predictions should use this format:
- **Age X-Y** (Dasha Lord-Sub Lord period, Date Range): What happens and why

Example: "Age 26-28 (Saturn-Moon, Nov 2027 - Jun 2029): Strongest marriage window. 7th lord Moon activated during Saturn MD which aspects the 7th house."

## Output Format

When the user asks for a full reading, produce a comprehensive markdown document covering:

### Section 1: Chart Summary
- Birth data and Lagna
- Planet position table (sign, house, nakshatra, dignity, retrograde)
- Key yogas and doshas
- Current and upcoming Dasha periods

### Section 2: Personality & Self (1st House + Lagna Lord)
- Physical constitution, temperament
- Natural strengths and weaknesses
- How the world perceives them

### Section 3: Career & Professional Life
- 10th house analysis (D1 + D10 Dasamsa)
- Career type: job vs business, which field
- Timeline: career peaks, promotions, transitions
- Financial prosperity (2nd + 11th house synthesis)

### Section 4: Marriage & Love Life
- 7th house analysis (D1 + D9 Navamsa)
- Marriage timing and number of marriages
- Partner characteristics and compatibility
- Love relationships, breakups, patterns
- Mangal Dosha impact if present

### Section 5: Family & Children
- Parents (4th house mother, 9th house father, D12 Dwadasamsa)
- Siblings (3rd house + D3 if available)
- Children (5th house + D7 Saptamsa) — timing, count, gender
- Family karma and ancestral patterns

### Section 6: Health & Longevity
- Physical vulnerabilities by planet and house
- Disease timelines tied to Dasha periods
- Longevity assessment (Parashara three-pair method)
- Health of parents

### Section 7: Wealth & Property
- 2nd house (accumulated wealth), 11th house (income/gains)
- Property and vehicles (4th house)
- Inheritance potential (8th house)
- Best financial periods by Dasha

### Section 8: Spirituality & Karma
- 9th house (dharma), 12th house (moksha)
- D60 Shastiamsa past-life karma indicators
- Karmic debts and how to resolve them
- Spiritual inclinations and practices

### Section 9: Lal Kitab Complete Analysis
- Planet-by-planet Pakka Ghar assessment
- Rin (debt) identification: Pitra Rin, Stree Rin, Self-created debts
- Sleeping and Blind planets
- Planetary age triggers (when each planet "awakens")
- Complete Totke (remedy) list

### Section 10: Remedies Master List
- Vedic remedies (mantras, gemstones, charity)
- Lal Kitab Totke (practical folk remedies)
- Behavioral modifications by Dasha period
- Things to avoid and why

### Section 11: Specific Questions
If the user asks about specific topics, create additional sections addressing them directly with chart evidence.

## Life-Decode Analysis Types

In addition to full readings, users may request specific "Life-Decode" analysis types. These synthesize Vedic chart data with numerology for targeted readings. See `references/numerology-life-decode.md` for the complete frameworks.

### Available Life-Decode Types

1. **Life-Path Decoder**: Numerology profile (Life Path + Birth Day) → Vedic-Numerology synthesis → Core Personality Architecture (Primary Drive, Shadow Pattern, Superpower)
2. **Soul-Purpose Guide**: Ketu (past-life mastery) + Rahu (this-life mission) + 9th house (dharmic path) + D60 karma + Life Path → Core Soul Mission Statement + Daily Alignment Practice
3. **Career Destiny**: 10th house (D1 + D10) + Saturn + Mercury + Life Path → Professional DNA + 3 Best Career Paths (scored 1-10) + 1 Path to Avoid + Career Timeline + Career Alignment Table
4. **Love & Relationship Compatibility**: 7th house (D1 + D9) + Venus + 5th house + Moon + Birth Day → Love Language + Ideal Partner Profile + Marriage Timing + Compatibility Markers
5. **Wealth & Abundance Strategy**: 2nd/11th/9th houses + Jupiter + Venus + Saturn + Birth Day + Personal Year → Money Personality + Wealth Timeline + Wealth Blocks + Financial Golden Rule
6. **Life Time-Map**: Full Dasha timeline + Lal Kitab age triggers + Personal Year cycle → Life Chapters Overview + 5-Year Roadmap (career, relationships, finance, health, growth per year) + Critical Turning Points

### When to Produce Life-Decode Documents

If the user requests one or more of these analysis types, produce a comprehensive document (markdown or docx) covering each requested type. Always compute numerology numbers first and cross-reference with the Vedic chart throughout.

## Handling Specific Questions

After the full reading, users often ask follow-up questions. For each question:

1. Identify which houses and planets are relevant
2. Check the Dasha timeline for activation periods
3. Cross-reference D1, relevant Varga, and Lal Kitab
4. Give a direct answer with age/date ranges
5. Provide remedies specific to the question

Common questions and their chart indicators:

| Question | Primary Houses | Key Planets | Varga |
|----------|---------------|-------------|-------|
| When will I marry? | 7th, 2nd, 11th | Venus, 7th lord | D9 |
| Will I go abroad? | 12th, 9th, 3rd | Rahu, 12th lord | D1 |
| Career or business? | 10th, 7th, 3rd | 10th lord, Saturn, Mercury | D10 |
| Will I be rich? | 2nd, 11th, 9th | Jupiter, 2nd/11th lords | D1 |
| Health problems when? | 6th, 8th, 1st | Saturn, Mars, 6th lord | D1 |
| When will I have children? | 5th, 7th | Jupiter, 5th lord | D7 |
| Parents' health/longevity? | 4th, 9th, 10th | Moon, Sun, 4th/9th lords | D12 |
| Breakups/divorces? | 7th, 6th, 8th, 12th | Venus, Mars, Rahu | D9 |

## Improvement & Remedial Roadmaps

When the user asks "what should I do to improve X?", produce actionable roadmaps:

1. **Identify the weak link** — Which planet/house combination is causing the issue?
2. **Check the Dasha window** — When does the relevant planet activate?
3. **Layer remedies from both systems**:
   - Vedic: Mantras, gemstones, charity days
   - Lal Kitab: Folk Totke (feeding animals, metals in water, specific donations)
   - Behavioral: What to do/avoid during specific periods
4. **Create a timeline** — "Do X during age Y-Z for maximum effect"

## Important Notes

- **Sidereal zodiac (Lahiri Ayanamsa)** — NOT tropical. This is critical. Western astrology uses tropical; Vedic uses sidereal. The difference is ~24 degrees.
- **Whole Sign house system** — Each sign = one complete house. No Placidus, Koch, etc.
- **Rahu/Ketu are always retrograde** — They're shadow planets (mathematical points), always moving backwards.
- **Never sugarcoat** — Vedic astrology is meant to prepare, not placate. Give the full picture with both positives and negatives.
- **Always pair negatives with remedies** — Every problem has a mitigation path.
- **Be timeline-specific** — Vague predictions are useless. Tie everything to Dasha periods and ages.
- **Lal Kitab remedies are practical** — They don't require expensive rituals. Feeding crows, keeping saffron water, donating specific items — these are accessible to everyone.

## Resources

### scripts/
- `vedic_calculator.py` — The main computation engine. Takes birth data as CLI arguments, outputs complete chart data as JSON or pretty-printed text. Includes `--numerology` flag for Life Path, Birth Day, and Personal Year calculations.
- `install_deps.sh` — Installs pyswisseph and ephem dependencies.

### references/
- `interpretation-framework.md` — Detailed planet-in-house interpretation guide, aspect analysis, dignity effects
- `lal-kitab-guide.md` — Complete Lal Kitab reference: Rin system, planetary ages, Totke remedies, Pakka Ghar effects
- `life-domain-analysis.md` — Domain-specific analysis frameworks for career, love, health, finance, family, longevity
- `numerology-life-decode.md` — Numerology calculation methods, Vedic-Numerology cross-reference, and 6 Life-Decode analysis frameworks with complete reading structures
