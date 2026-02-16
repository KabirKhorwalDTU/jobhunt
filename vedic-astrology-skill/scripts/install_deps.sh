#!/bin/bash
# Install dependencies for Vedic astrology calculations
pip install pyswisseph ephem --break-system-packages -q 2>/dev/null || pip install pyswisseph ephem -q 2>/dev/null
echo "Dependencies installed: pyswisseph, ephem"
