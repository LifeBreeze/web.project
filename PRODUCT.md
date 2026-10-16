# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML + one external CSS file (no framework, no Tailwind). The assignment grades "all presentation in an external stylesheet, no inline style" and requires 0 errors on the W3C HTML and CSS validators, so the stack is fixed by the rubric.

## Users

- Primary: the course instructor/TA grading the 2026 Web Programming midterm assignment. They check each requirement (F-01 to F-06, Q-HTML, Q-CSS, Q-DEPLOY) against fixed acceptance criteria, at a 1280px-wide window, then run the W3C validators.
- Secondary: anyone the student later shares the deployed résumé URL with.

## Product Purpose

A one-page personal résumé site for "Life1008", a first-year student in 상명대학교 소프트웨어학과, deployed on the student's smu.ai.kr site. Success means every acceptance criterion passes and the page no longer looks plain or templated.

## Positioning

A first-year student who has been building games since high school (Entry, Python, C, C#), and who won the grand prize at the 2026 spring-semester hackathon. Interest: game development.

## Operating Context

- Section order is fixed by the assignment's screen design: header (F-01, F-02) → section 실적 (F-03) → section 수강 과목 (F-04) → section 주차별 링크 (F-05) → footer (F-06). Colour, font, size and detailed layout are free.
- F-01: activity name (not real name), "상명대학교 소프트웨어학과 1학년", and a one-sentence intro of 50 characters or fewer that names the interest area. All three must show without scrolling at a 1280px window.
- F-02: exactly one GitHub profile link, in the header or footer. No other contact info anywhere.
- F-03: a `<table>` of at least 4 entries, at least one from middle or high school. Each entry has a date (YYYY.MM), a category (프로젝트·수상·자격·활동·교육), the content and the student's role. Newest first.
- F-04: every 2026-2 course with its 전공/교양 type. 「웹프로그래밍 및 AI에이전트 활용」 links to F-05.
- F-05: weeks 1 to 15. Completed weeks link to their practice page; the rest read "예정" with no link. The two states differ in colour.
- F-06: footer text "최종 수정일: YYYY-MM-DD", matching the deploy repo's last commit date.
- Q-HTML: DOCTYPE, lang, charset, title; semantic regions; table for tabular data, lists for lists; alt text on images.

## Capabilities and Constraints

- Privacy rules: no real name, student ID, birthdate, address, contact info or face photo. School names are generalised (e.g. "고등학교 화학 동아리").
- Weeks 1 to 7 link to `./week1.html` … `./week7.html`. Those files are not in the repo yet; the user chose to keep these paths and add the files later. Until then they are broken links.
- Correct course name: "AI시대의컬처리터러시" (confirmed by the user).

## Brand Commitments

- Activity name: Life1008. GitHub: LifeBreeze.

## Evidence on Hand

- The achievements list in doc00.html (2019.07 to 2026.10) is the confirmed factual record. Do not add, embellish or reorder entries beyond newest-first.
- No photos, screenshots or project images are available. Do not invent any.

## Product Principles

1. Every acceptance criterion passes by inspection. Design never hides or reorders a required element.
2. Facts stay exactly as the student wrote them; design adds character, not claims.
3. Validator-clean, semantic HTML and external CSS are part of the craft, not an afterthought.
