from pathlib import Path

from scripts.sync_publications import convert

FIXTURE = """
@article{demo2026,
  title = {A demo paper},
  author = {Li, Xiang and Zhang, San},
  journal = {Journal of Demos},
  year = {2026},
  doi = {10.1000/demo.2026},
  keywords = {effector, genomics},
  annotation = {featured, first}
}
"""


def test_convert_maps_fields(tmp_path: Path) -> None:
    bib = tmp_path / "in.bib"
    bib.write_text(FIXTURE, encoding="utf-8")
    result = convert(bib)

    assert result["count"] == 1
    item = result["items"][0]
    assert item["id"] == "demo2026"
    assert item["title"] == "A demo paper"
    assert item["authors"] == ["Li, Xiang", "Zhang, San"]
    assert item["year"] == 2026
    assert item["venue"] == "Journal of Demos"
    assert item["type"] == "journal"
    assert item["doi"] == "10.1000/demo.2026"
    assert item["keywords"] == ["effector", "genomics"]
    assert item["featured"] is True
    assert item["authorRole"] == "first"


def test_convert_sorts_by_year_desc(tmp_path: Path) -> None:
    bib = tmp_path / "in.bib"
    bib.write_text(
        FIXTURE
        + """
@article{older2024,
  title = {An older paper},
  author = {Li, Xiang},
  journal = {Old Journal},
  year = {2024}
}
""",
        encoding="utf-8",
    )
    result = convert(bib)
    assert [item["id"] for item in result["items"]] == ["demo2026", "older2024"]
