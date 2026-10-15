"""把 content/publications.bib 转换为 content/publications.json。

用法：
    /Users/lixiang/miniforge3/envs/python/bin/python3 \
        /Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/scripts/sync_publications.py

输出字段必须与 src/content.config.ts 的 publicationItem schema 逐字段一致；
新增字段时两处同时改，否则 Astro 构建会因 zod 校验失败而报错。
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import bibtexparser

PROJECT_ROOT = Path("/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web")
BIB_PATH = PROJECT_ROOT / "content" / "publications.bib"
OUT_PATH = PROJECT_ROOT / "content" / "publications.json"

TYPE_BY_ENTRYTYPE = {
    "article": "journal",
    "inproceedings": "conference",
    "conference": "conference",
    "misc": "preprint",
    "unpublished": "preprint",
}

REQUIRED_FIELDS = {
    "id", "title", "authors", "year", "venue", "type", "doi",
    "url", "code", "pdf", "keywords", "featured", "authorRole",
}


def _split(value: str | None, sep: str) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(sep) if part.strip()]


def _flags(annotation: str | None) -> set[str]:
    return {flag.strip().lower() for flag in _split(annotation, ",")}


def _author_role(annotation: str | None) -> str:
    flags = _flags(annotation)
    if "co-first" in flags:
        return "co-first"
    if "first" in flags:
        return "first"
    if "corresponding" in flags:
        return "corresponding"
    return "co-author"


def _entry_to_item(entry: dict[str, str]) -> dict[str, object]:
    return {
        "id": entry["ID"],
        "title": " ".join(entry.get("title", "").split()),
        "authors": _split(entry.get("author"), " and "),
        "year": int(entry.get("year", "0") or 0),
        "venue": entry.get("journal") or entry.get("booktitle") or "",
        "type": TYPE_BY_ENTRYTYPE.get(
            entry.get("ENTRYTYPE", "article").lower(), "journal"
        ),
        "doi": entry.get("doi") or None,
        "url": entry.get("url") or None,
        "code": entry.get("code") or None,
        "pdf": entry.get("pdf") or None,
        "keywords": _split(entry.get("keywords"), ","),
        "featured": "featured" in _flags(entry.get("annotation")),
        "authorRole": _author_role(entry.get("annotation")),
    }


def _load_entries(bib_path: Path) -> list[dict[str, str]]:
    """读取 BibTeX，返回 [{"ENTRYTYPE": ..., "ID": ..., <字段名小写>: <值>}]。

    本机安装的是 bibtexparser 2.1.0：1.x 的 `bibtexparser.load()` 已被移除，
    改用 `parse_file()`，条目字段存在 `entry.fields`（`Field` 对象列表），
    因此这里把它们归一化成 1.x 那种「字段名 → 字符串」的平铺字典，下游
    `_entry_to_item()` 的取值方式与 brief 保持一致。
    如需更严格解析（如 LaTeX 转义、宏展开），再显式加 middleware，不靠默认。
    """
    library = bibtexparser.parse_file(bib_path)
    entries: list[dict[str, str]] = []
    for entry in library.entries:
        flat = {"ENTRYTYPE": entry.entry_type, "ID": entry.key}
        for field in entry.fields:
            flat[field.key.lower()] = field.value
        entries.append(flat)
    return entries


def convert(bib_path: Path) -> dict[str, object]:
    """读取 BibTeX 文件，返回与 zod schema 对齐的字典。"""
    items = [_entry_to_item(entry) for entry in _load_entries(bib_path)]
    items.sort(key=lambda item: (-int(item["year"]), str(item["id"])))

    tz = timezone(timedelta(hours=8))
    return {
        "generated_at": datetime.now(tz).isoformat(timespec="seconds"),
        "source": "content/publications.bib",
        "count": len(items),
        "items": items,
    }


def main() -> None:
    if not BIB_PATH.exists():
        raise SystemExit(f"[FATAL] 找不到 {BIB_PATH}")

    payload = convert(BIB_PATH)
    OUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # 回读自检：产物写完必须回读核对结构
    reloaded = json.loads(OUT_PATH.read_text(encoding="utf-8"))
    assert reloaded["count"] == len(reloaded["items"]), "count 与 items 长度不一致"
    assert reloaded["count"] == payload["count"], "落盘条数与生成条数不一致"
    for item in reloaded["items"]:
        missing = REQUIRED_FIELDS - set(item)
        if missing:
            raise SystemExit(
                f"[FATAL] 条目 {item.get('id')} 缺字段：{sorted(missing)}"
            )

    print(f"[INFO] 写入 {OUT_PATH}（{reloaded['count']} 条）")
    print(f"[INFO] 回读自检通过：字段齐全、count 一致（{reloaded['count']}）")


if __name__ == "__main__":
    main()
