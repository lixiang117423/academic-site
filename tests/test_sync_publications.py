from pathlib import Path

import pytest

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


def test_convert_incollection_maps_to_book_chapter_with_booktitle_venue(
    tmp_path: Path,
) -> None:
    bib = tmp_path / "in.bib"
    bib.write_text(
        """
@incollection{chapter2025,
  title = {A chapter},
  author = {Li, Xiang},
  booktitle = {Handbook of Demos},
  year = {2025}
}
""",
        encoding="utf-8",
    )
    result = convert(bib)

    item = result["items"][0]
    assert item["type"] == "book-chapter"
    assert item["venue"] == "Handbook of Demos"


def test_convert_unknown_entry_type_falls_back_to_other_and_warns(
    tmp_path: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    bib = tmp_path / "in.bib"
    bib.write_text(
        """
@dataset{data2023,
  title = {A dataset},
  author = {Li, Xiang},
  year = {2023},
  publisher = {Some Repository}
}
""",
        encoding="utf-8",
    )

    result = convert(bib)

    # 未知类型必须仍然产出条目（管道不中断），只回退到 other
    assert result["count"] == 1
    assert result["items"][0]["type"] == "other"

    # 告警必须走 stderr，且点名 entry type 与回退到的条目 ID
    captured = capsys.readouterr()
    assert captured.out == ""
    assert "[WARN]" in captured.err
    assert "dataset" in captured.err
    assert "data2023" in captured.err
