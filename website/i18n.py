"""Lightweight dictionary-based i18n for TEKK Solutions.

Usage (in any template — injected automatically via context processor):
    {{ t.nav.home }}
    {{ t.index.hero.title | safe }}   ← | safe for values containing HTML
"""

import json
import os

_SUPPORTED = {"en", "fr"}
_cache: dict[str, dict] = {}


def get_t(lang: str = "en") -> dict:
    """Return the full translation dict for *lang*, falling back to English."""
    lang = lang if lang in _SUPPORTED else "en"
    if lang not in _cache:
        path = os.path.join(os.path.dirname(__file__), "translations", f"{lang}.json")
        with open(path, "r", encoding="utf-8") as fh:
            _cache[lang] = json.load(fh)
    return _cache[lang]
