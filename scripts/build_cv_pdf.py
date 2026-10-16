"""从仓库内的真实数据生成中英两份 CV PDF（public/cv/cv-en.pdf、public/cv/cv-zh.pdf）。

用法：
    /Users/lixiang/miniforge3/envs/python/bin/python3 \
        /Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/scripts/build_cv_pdf.py

数据来源（全部取自仓库内的唯一权威源，不额外维护副本）：
    content/site.yaml           姓名 / 职位 / 机构 / 联系方式 / 链接
    content/cv.yaml             教育经历、工作经历、获奖、报告
    content/publications.json   由 scripts/sync_publications.py 从 publications.bib 生成
    content/publications.bib    取卷期页码（published.json 不含这三项）
    content/software/*.md       软件条目（frontmatter）

渲染方式：先把 HTML 写到临时目录，再用本机 Chrome 无头模式打印为 PDF——Chrome 会把
PingFang SC 等中文字形**内嵌**进 PDF，避免方块字（R 的默认 pdf() 设备做不到）。临时
HTML 不放系统 /tmp，统一放 ~/tmp/my_academic_web_cv/。

默认**不覆盖**已存在的 PDF：要重新生成必须显式加 --force（项目规约：不得覆盖写入已有文件）。
"""

from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import bibtexparser
import yaml

PROJECT_ROOT = Path("/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web")
CONTENT = PROJECT_ROOT / "content"
OUT_DIR = PROJECT_ROOT / "public" / "cv"
WORK_DIR = Path.home() / "tmp" / "my_academic_web_cv"
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

ROLE_EN = {
    "first": "first author",
    "co-first": "co-first author",
    "corresponding": "corresponding author",
    "co-author": "",
}
ROLE_ZH = {
    "first": "第一作者",
    "co-first": "共同第一作者",
    "corresponding": "通讯作者",
    "co-author": "",
}

SECTIONS = {
    "en": {
        "positions": "Positions",
        "education": "Education",
        "awards": "Awards",
        "talks": "Talks",
        "publications": "Publications",
        "software": "Software",
    },
    "zh": {
        "positions": "工作经历",
        "education": "教育经历",
        "awards": "获奖",
        "talks": "报告",
        "publications": "论文发表",
        "software": "软件",
    },
}


def esc(text: str) -> str:
    """转义 HTML，再把内容里成对的 *斜体* 标记放行为 <em>（与站点 rich-text.ts 同规则）。"""
    escaped = html.escape(text, quote=True)
    return re.sub(r"\*([^*\n]+)\*", r"<em>\1</em>", escaped)


def load_yaml(path: Path) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def load_bib_details(path: Path) -> dict[str, dict[str, str]]:
    """取 BibTeX 的 volume / number / pages，按条目 key 索引。"""
    details: dict[str, dict[str, str]] = {}
    for entry in bibtexparser.parse_file(path).entries:
        fields = {f.key.lower(): f.value for f in entry.fields}
        details[entry.key] = {
            key: fields[key] for key in ("volume", "number", "pages") if fields.get(key)
        }
    return details


def localized(value: object, locale: str) -> str:
    """双语字段取值；中文缺失或空白时回退英文（与站点 pick() 同语义）。"""
    if not isinstance(value, dict):
        return str(value or "")
    primary = (value.get(locale) or "").strip()
    if primary:
        return primary
    return (value.get("en") or "").strip()


def _end_label(value: str, locale: str) -> str:
    """在职期间的中文写法：Present → 至今（其余取值原样保留）。"""
    text = (value or "").strip()
    if locale == "zh" and text.lower() in {"present", "now", "current"}:
        return "至今"
    return text


def entry_line(entry: dict, locale: str) -> str:
    """把 cv.yaml 的一条履历渲染成一行：时间 · 职位 · 机构 · 备注。"""
    start = str(entry.get("start", "")).strip()
    end = _end_label(str(entry.get("end", "")), locale)
    # 单年条目（如 2024 年获奖）不写「2024–2024」
    period = start if start == end else f"{start}–{end}"
    title = esc(localized(entry.get("title"), locale))
    org = esc(localized(entry.get("org"), locale))
    note = localized(entry.get("note"), locale)
    note_html = f'<span class="note"> — {esc(note)}</span>' if note else ""
    return (
        '<li><span class="period">'
        f"{esc(period)}</span> <strong>{title}</strong>, {org}{note_html}</li>"
    )


def publication_line(
    item: dict, details: dict[str, str], locale: str, self_authors: set[str]
) -> str:
    authors = []
    for author in item["authors"]:
        shown = esc(author)
        if author.strip().lower() in self_authors:
            shown = f"<strong>{shown}</strong>"
        authors.append(shown)

    venue = esc(item["venue"])
    bits = [f'<em>{venue}</em>']
    volume = details.get("volume")
    issue = details.get("number")
    pages = details.get("pages")
    if volume:
        bits.append(f"{esc(volume)}" + (f"({esc(issue)})" if issue else ""))
    # 预印本的 pages 是 bioRxiv 的编号（形如 2024.02.15.579491），与年份重复，不重复渲染
    if pages and item["type"] != "preprint":
        bits.append(esc(pages.replace("--", "–")))  # BibTeX 的 -- 页码区间转 en dash
    bits.append(str(item["year"]))
    venue_html = ", ".join(bits)

    role = (ROLE_ZH if locale == "zh" else ROLE_EN)[item["authorRole"]]
    role_html = f' <span class="role">({role})</span>' if role else ""

    doi_html = (
        f' · <a href="https://doi.org/{esc(item["doi"])}">doi:{esc(item["doi"])}</a>'
        if item.get("doi")
        else ""
    )
    return (
        f'<li><span class="authors">{", ".join(authors)}</span>. '
        f'<span class="pub-title">{esc(item["title"])}</span>. '
        f"{venue_html}.{role_html}{doi_html}</li>"
    )


def software_line(item: dict, locale: str) -> str:
    tagline = esc(localized(item.get("tagline"), locale))
    repo = esc(item.get("repo", ""))
    language = esc(item.get("language", ""))
    return (
        f'<li><strong>{esc(item.get("name", ""))}</strong> '
        f'<span class="note">({language})</span> — {tagline} '
        f'<a href="{repo}">{repo.replace("https://", "")}</a></li>'
    )


def build_html(locale: str, data: dict) -> str:
    site = data["site"]
    name = localized(site["name"], locale)
    title = localized(site["title"], locale)
    affiliation = localized(site["affiliation"], locale)
    bio = localized(site["bio"], locale)
    headings = SECTIONS[locale]
    self_authors = {author.strip().lower() for author in site.get("selfAuthors", [])}

    contact = [f'<a href="mailto:{esc(site["email"])}">{esc(site["email"])}</a>']
    contact += [
        f'<a href="{esc(link["url"])}">{esc(link["label"])}</a>'
        for link in site.get("links", [])
    ]
    contact.append(
        f'<a href="{esc(site["blog"]["url"])}">'
        f'{esc(localized(site["blog"]["label"], locale))}</a>'
    )

    blocks = []
    for key in ("positions", "education", "awards", "talks"):
        entries = data["cv"].get(key) or []
        if not entries:
            continue
        items = "\n".join(entry_line(entry, locale) for entry in entries)
        blocks.append(f"<h2>{headings[key]}</h2>\n<ul>\n{items}\n</ul>")

    pubs = "\n".join(
        publication_line(item, data["bib_details"].get(item["id"], {}), locale, self_authors)
        for item in data["publications"]
    )
    blocks.append(f"<h2>{headings['publications']}</h2>\n<ol class=\"pubs\">\n{pubs}\n</ol>")

    if data["software"]:
        items = "\n".join(software_line(item, locale) for item in data["software"])
        blocks.append(f"<h2>{headings['software']}</h2>\n<ul>\n{items}\n</ul>")

    body = "\n".join(blocks)
    generated = data["generated"]

    return f"""<!doctype html>
<html lang="{'zh-CN' if locale == 'zh' else 'en'}">
<head>
<meta charset="utf-8" />
<title>{esc(name)} — CV ({locale})</title>
<style>
  @page {{ size: A4; margin: 18mm 16mm; }}
  html {{ font-size: 10.5pt; }}
  body {{
    font-family: "PingFang SC", "Songti SC", Georgia, "Times New Roman", serif;
    color: #24292f; line-height: 1.5; margin: 0;
  }}
  h1 {{ font-size: 20pt; margin: 0 0 2pt; letter-spacing: -0.01em; }}
  .lead {{ margin: 0 0 4pt; font-size: 11pt; }}
  .contact {{ margin: 0 0 2pt; font-size: 9.5pt; color: #4b5563;
             font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif; }}
  .contact a {{ color: #1e4e8c; text-decoration: none; }}
  .bio {{ margin: 10pt 0 0; text-align: justify; }}
  h2 {{ font-size: 12pt; margin: 16pt 0 5pt; padding-bottom: 3pt;
        border-bottom: 1px solid #e3e3e0;
        font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif; }}
  ul, ol {{ margin: 0; padding-left: 1.15em; }}
  li {{ margin-bottom: 5pt; }}
  .period {{ color: #6b7280; font-variant-numeric: tabular-nums; }}
  .note {{ color: #6b7280; }}
  .role {{ color: #6b7280; }}
  .pubs .authors {{ color: #24292f; }}
  .pubs .pub-title {{ font-weight: 600; }}
  a {{ color: #1e4e8c; text-decoration: none; word-break: break-all; }}
  footer {{ margin-top: 18pt; font-size: 8.5pt; color: #6b7280;
            border-top: 1px solid #e3e3e0; padding-top: 5pt; }}
</style>
</head>
<body>
  <h1>{esc(name)}</h1>
  <p class="lead">{esc(title)} · {esc(affiliation)} · {esc(site['location'])}</p>
  <p class="contact">{' · '.join(contact)}</p>
  <p class="bio">{esc(bio)}</p>
{body}
  <footer>
    {esc(site['name'].get('en', ''))} · generated {generated} ·
    https://github.com/lixiang117423
  </footer>
</body>
</html>
"""


def render_pdf(html_path: Path, pdf_path: Path) -> None:
    if not CHROME.exists():
        raise SystemExit(f"[FATAL] 找不到 Chrome：{CHROME}")
    result = subprocess.run(
        [
            str(CHROME),
            "--headless=new",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--print-to-pdf={pdf_path}",
            html_path.as_uri(),
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        raise SystemExit(f"[FATAL] Chrome 打印失败（退出码 {result.returncode}）")
    if not pdf_path.exists() or pdf_path.read_bytes()[:4] != b"%PDF":
        raise SystemExit(f"[FATAL] {pdf_path} 不是有效的 PDF")


def main() -> None:
    parser = argparse.ArgumentParser(description="生成中英两份 CV PDF")
    parser.add_argument(
        "--force",
        action="store_true",
        help="允许覆盖已存在的 public/cv/cv-*.pdf（默认拒绝，避免覆盖旧文件）",
    )
    args = parser.parse_args()

    targets = {locale: OUT_DIR / f"cv-{locale}.pdf" for locale in ("en", "zh")}
    existing = [path for path in targets.values() if path.exists()]
    if existing and not args.force:
        listing = "\n".join(f"  - {path}" for path in existing)
        raise SystemExit(
            "[FATAL] 目标 PDF 已存在，未覆盖（项目规约：不得覆盖写入已有文件）：\n"
            f"{listing}\n如确认要重新生成，加 --force 重跑本脚本。"
        )

    bib_details = load_bib_details(CONTENT / "publications.bib")
    publications = json.loads((CONTENT / "publications.json").read_text(encoding="utf-8"))

    software = []
    for path in sorted((CONTENT / "software").glob("*.md")):
        text = path.read_text(encoding="utf-8")
        match = re.match(r"^---\r?\n([\s\S]*?)\r?\n---", text)
        if match is None:
            raise SystemExit(f"[FATAL] {path} 缺 frontmatter")
        software.append(yaml.safe_load(match.group(1)))
    software.sort(key=lambda item: item.get("order", 999))

    data = {
        "site": load_yaml(CONTENT / "site.yaml"),
        "cv": load_yaml(CONTENT / "cv.yaml"),
        "publications": publications["items"],
        "bib_details": bib_details,
        "software": software,
        "generated": datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d"),
    }

    stamp = datetime.now(timezone(timedelta(hours=8))).strftime("%Y%m%d-%H%M%S")
    work_dir = WORK_DIR / stamp
    work_dir.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] 临时目录：{work_dir}")
    for locale in ("en", "zh"):
        html_path = work_dir / f"cv-{locale}.html"
        html_path.write_text(build_html(locale, data), encoding="utf-8")
        render_pdf(html_path, targets[locale])
        size_kb = targets[locale].stat().st_size / 1024
        print(f"[INFO] 写入 {targets[locale]}（{size_kb:.1f} KB）")

    # 回读自检：两份 PDF 都是有效文件且非空
    for locale, path in targets.items():
        payload = path.read_bytes()
        if payload[:4] != b"%PDF" or len(payload) < 10_000:
            raise SystemExit(f"[FATAL] {path} 自检失败（{len(payload)} 字节）")
    print("[INFO] 回读自检通过：两份 PDF 均为有效 %PDF 且体积正常")
    print(f"[INFO] 论文条目 {len(data['publications'])} 条、软件条目 {len(software)} 条")


if __name__ == "__main__":
    main()
