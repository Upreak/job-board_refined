# prompts/prompt_renderer.py
import yaml
from jinja2 import Template
from pathlib import Path
from typing import Dict, Any
import json

TEMPLATE_PATH = Path(__file__).parent / "templates.yaml"


class PromptRenderer:

    def __init__(self, template_path: Path = None):
        self.template_path = template_path or TEMPLATE_PATH
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, Any]:
        if not self.template_path.exists():
            raise FileNotFoundError(f"Template file missing: {self.template_path}")

        with open(self.template_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}

        if not isinstance(data, dict):
            raise ValueError("templates.yaml must contain a dictionary at the top level.")

        return data

    def reload(self):
        """Reload templates at runtime (called by Admin Panel)."""
        self.templates = self._load_templates()

    def _resolve_base_chain(self, name: str) -> Dict[str, Any]:
        tpl = self.templates.get(name)
        if tpl is None:
            raise KeyError(f"Template '{name}' not found.")

        final = {}
        if "base" in tpl:
            parent_name = tpl["base"]
            parent_tpl = self._resolve_base_chain(parent_name)
            final.update(parent_tpl)

        final.update(tpl)
        final.pop("base", None)
        return final

    def _render_part(self, text: str, context: dict) -> str:
        if not text:
            return ""
        return Template(text).render(**context)

    def render(self, name: str, context: Dict[str, Any], json_safe=False) -> str:
        tpl = self._resolve_base_chain(name)

        if json_safe:
            context = {k: json.dumps(v, ensure_ascii=False) for k, v in context.items()}

        system = self._render_part(tpl.get("system", ""), context)
        dev = self._render_part(tpl.get("developer", ""), context)
        user = self._render_part(tpl.get("user", ""), context)
        assistant = self._render_part(tpl.get("assistant", ""), context)

        parts = [p for p in [system, dev, user, assistant] if p.strip()]
        return "\n\n".join(parts)


# Singleton
renderer = PromptRenderer()
