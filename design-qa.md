# Design QA — Vertical Scrollytelling Portfolio

## Evidence and normalization

- Source visual truth: `E:\WEB\mywebsitenotebook\audit-screenshots\vertical-life-target.png`.
- Source dimensions: 719 × 2188 pixels; long-page desktop concept at 1440 CSS-pixel design intent.
- Desktop implementation: `E:\WEB\mywebsitenotebook\audit-screenshots\vertical-portfolio-desktop.jpg`.
- Life chapter implementation: `E:\WEB\mywebsitenotebook\audit-screenshots\vertical-portfolio-life.jpg`.
- Mobile implementation: `E:\WEB\mywebsitenotebook\audit-screenshots\vertical-portfolio-mobile.jpg`.
- Desktop CSS viewport: 1440 × 1024 at device density 1; captured content pixels: 1425 × 1013 after browser scrollbar allowance.
- Mobile CSS viewport: 390 × 844 at device density 1; captured content pixels: 375 × 812 after browser scrollbar allowance.
- Combined comparison: `E:\WEB\mywebsitenotebook\audit-screenshots\vertical-design-comparison.png`.
- Work experience evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\career-experience-desktop.jpg` and `career-experience-mobile.jpg`.
- Education evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\career-education-desktop.jpg` and `career-education-mobile.jpg`.
- Career style-system comparison: `E:\WEB\mywebsitenotebook\audit-screenshots\career-design-comparison.png`.
- Compared states: desktop hero at scroll origin and desktop `BEYOND THE SCREEN` pinned midpoint; mobile hero at scroll origin.

The long source was normalized into two focused 703 × 500 crops—hero and life chapter—then fitted to the 1425 × 1013 browser captures. This avoids false findings caused by comparing a full long-page board to a single viewport. The combined comparison includes both regions side by side, so typography, composition, image treatment, spacing, palette and personal content are readable at review scale.

## Findings

- No actionable P0, P1 or P2 findings remain.
- [P3] The implementation uses the user's actual portrait assets instead of the generated concept portrait. The crop and pose therefore differ, but subject fidelity is higher and the black-and-white treatment preserves the intended hierarchy.
- [P3] The life collage occupies more negative space at its early pinned state than the static concept. This is intentional: later scroll progress brings cooking and basketball into view rather than showing every hobby simultaneously.

## Required fidelity surfaces

- Fonts and typography: passed. Archivo carries the large condensed editorial display hierarchy; Space Mono carries metadata and supporting copy. Scale, line height and letter spacing follow the source's oversized grotesk / technical mono relationship without truncation at tested breakpoints.
- Spacing and layout rhythm: passed. The dark hero, warm-paper manifesto, full-viewport project chapters, personal-life spread, notebook rows, work history, education and closing statement preserve the source's long editorial rhythm and asymmetric grid.
- Colors and tokens: passed. Near-black, warm paper, lavender and restrained coral map directly to the selected concept. Contrast remains legible in both themes.
- Image quality and asset fidelity: passed. Live Firebase project covers, the user's real portrait, and the supplied photography, gaming, cooking and basketball collage assets are used. No visible target imagery is replaced by placeholders, CSS art or handmade SVGs.
- Copy and content: passed. Hero positioning, project summaries, Turku-based personal introduction, life interests, five work roles, two education records, Notebook and contact content form a coherent standalone portfolio narrative.
- Icons and affordances: passed. The existing fine-line icon set matches the technical mono treatment; case-study, navigation, contact and close controls have visible hover/focus states.
- Responsiveness and accessibility: passed. Desktop uses scroll-scrubbed pinned chapters; mobile becomes a natural vertical composition. The 390 px viewport has no horizontal overflow. Semantic headings, buttons, links, dialog labels, alt text and reduced-motion overrides are present.

## Comparison history

- P2: initial desktop implementation omitted the source's right chapter rail and used only a top navigation. Added a persistent, clickable chapter rail and retained the compact top navigation only on mobile. Post-fix evidence: `vertical-portfolio-desktop.jpg` and `vertical-design-comparison.png`.
- P2: the mobile `GROUNDED` life word extended past the content width. Reduced the mobile life-word scale from 18vw to 15.5vw. Post-fix mobile evidence: `vertical-portfolio-mobile.jpg`; layout width check returned `scrollWidth: 375` within a 390 px viewport.
- P2: live projects initially appeared in database order, which put Baolu Route before the source's LILT lead chapter. Added a stable semantic priority order: LILT, Baolu Route, VINCE, Notebook OS, museum project. Post-fix browser DOM verification confirmed this order.
- P2: work history was visually hidden behind the ambiguous heading `Design / Build / Ship`, and education had no dedicated chapter. Replaced it with explicit `WORK EXPERIENCE` and `EDUCATION` sections, expanded the work list to five roles, and added both existing degree records. Post-fix evidence: `career-design-comparison.png`.
- P2: the first mobile `WORK EXPERIENCE` capture clipped the final letters at 390 px. Reduced the mobile career heading from 17vw to 14vw. Post-fix evidence: `career-experience-mobile.jpg`; layout check returned `scrollWidth: 375` within a 390 px viewport.

## Interaction and runtime verification

- Natural vertical wheel scrolling: passed.
- Scroll-scrubbed hero parallax and line reveal: passed.
- Pinned manifesto with changing key words: passed.
- Five project chapters with distinct image/copy motion treatments: passed.
- Pinned personal-life collage with staged hobby reveals and timeline: passed.
- Five-entry work-experience timeline and dedicated career navigation: passed.
- Two-entry education chapter with distinct paper treatment and scroll reveal: passed.
- Chapter rail and mobile section navigation: passed.
- LILT case-study dialog open and close: passed.
- Notebook dialog implementation present and wired to live posts.
- Production build: passed.

## Final disposition — case-study legibility pass

- Latest focused report: `Focused case-study legibility and scroll QA — 2026-08-04` above.
- Remaining findings: P3 enrichment opportunity only; no actionable P0/P1/P2 issues.

final result: passed

## Focused mobile scroll-motion restoration - 2026-08-04

### Evidence and normalization

- Source visual truth: `E:\WEB\mywebsitenotebook\audit-screenshots\mobile-home-after-390.png` (the accepted post-redesign mobile home composition before restoring the richer motion treatment).
- Browser-rendered implementation: `E:\WEB\mywebsitenotebook\audit-screenshots\mobile-motion-home.png`.
- CSS viewport: 390 x 844 at device density 1; source and implementation captures are both 375 x 812 pixels after scrollbar/browser-content allowance.
- Full-view side-by-side evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\mobile-motion-layout-comparison.png` (750 x 812). The comparison confirms that motion restoration did not alter the accepted hero layout.
- Focused interaction evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\mobile-motion-interaction-comparison.png` (1125 x 812), combining the pinned manifesto, project chapter, and personal-life scroll states.
- Additional browser captures: `mobile-motion-manifesto.png`, `mobile-motion-project.png`, and `mobile-motion-life.png`.
- Compared states: hero at scroll origin after entrance completion; pinned manifesto at the `SYSTEMS` state; LILT chapter mid-scroll; personal-life chapter mid-scroll.
- Focused region crops were not needed because the equal-size full-height captures keep display text, project media, body copy, portrait masking, and visible motion states readable.

### Findings and comparison history

- [P2] Mobile previously forced project and life transforms to `none`, so the page retained the content but lost the desktop story's sense of progression. Restored component-driven transform and opacity values with mobile-safe clipping and `will-change` hints. Post-fix evidence: `mobile-motion-project.png` and `mobile-motion-life.png`.
- [P2] The manifesto had been converted to a static natural-flow section on mobile. Reinstated a 220svh chapter with a 100svh sticky stage, allowing the existing progress state to move through `COMPLEXITY`, `IDEAS`, and `SYSTEMS`. Post-fix evidence: `mobile-motion-manifesto.png`.
- [P2] The longest manifesto word could clip at the 390 px breakpoint. Replaced the mobile display scale with a bounded clamp; the measured `SYSTEMS` right edge is 354.67 px inside the 375 px content width.
- [P2] The accepted mobile hero needed to remain visually unchanged while its counter-parallax stayed active. The source/implementation comparison shows matching typography, spacing, portrait crop, and fold position; measured after a 300 px scroll, copy moved -36.66 px while the portrait moved +54.99 px and scaled to 1.0306.

### Required fidelity surfaces

- Fonts and typography: passed. Archivo and Space Mono retain the accepted hierarchy; animated keywords, project copy, and personal-life words do not clip or overlap at 390 px.
- Spacing and layout rhythm: passed. Sticky and transformed layers remain inside their section bounds, the hero composition is unchanged, and the tested mobile viewport has no horizontal overflow.
- Colors and visual tokens: passed. Near-black, warm paper, lavender, coral, and muted neutrals are unchanged by the motion pass and retain readable contrast.
- Image quality and asset fidelity: passed. Existing real project imagery, portrait assets, and collage artwork remain sharp and correctly masked; no placeholders or code-drawn substitutes were introduced.
- Copy and content: passed. Hero positioning, manifesto statement, LILT metadata, and personal-life language are unchanged and fully visible.

### Interaction and runtime verification

- Hero copy/portrait counter-parallax: passed.
- Pinned manifesto with progress-driven keyword changes: passed.
- Project number, media, and copy motion: passed.
- Personal-life portrait, word layer, collage, and timeline motion: passed.
- Reduced-motion preference retains static transforms and full opacity: passed by component and CSS verification.
- Runtime error overlay during responsive scroll checks: none observed.
- Production build: passed; the only output is the existing Vite large-chunk advisory.

### Follow-up polish

- [P3] Motion strength is intentionally moderate on mobile to preserve legibility and battery-friendly rendering; it can be tuned after device testing without changing the layout.

final result: passed

## Focused mobile-home redesign — 2026-08-04

### Evidence and normalization

- Source visual truth: `E:\WEB\mywebsitenotebook\audit-screenshots\mobile-home-before.png` (the user-supplied mobile home screenshot).
- Browser-rendered implementation: `E:\WEB\mywebsitenotebook\audit-screenshots\mobile-home-after-wide.png`.
- Matched wide-mobile CSS viewport: 684 × 1379 at device density 1; source capture: 669 × 1347 pixels; implementation capture: 669 × 1349 pixels after scrollbar and browser-content allowance.
- Full-view comparison evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\mobile-home-comparison.png`; both sides were normalized to 1347 px height, producing a 1337 × 1347 combined image.
- Common-phone evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\mobile-home-after-390.png`; 390 × 844 CSS viewport, 375 × 812 captured pixels, density 1.
- Menu interaction evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\mobile-home-menu-open.png`.
- Compared state: home hero at scroll origin with the entrance animation complete; the menu-open state was checked separately.
- Focused comparison was not needed because the full-height comparison keeps the title, copy, CTA, portrait crop and handoff to the next section clearly readable.

### Findings and comparison history

- [P1] The old mobile hero retained a desktop-style split composition. The portrait began partway across the screen and left a large inactive black column. Rebuilt the mobile hero as a true single-column flow with a full-bleed portrait block. Post-fix evidence: `mobile-home-comparison.png`.
- [P1] The 25vw name scale dominated the screen and approached clipping at the right edge. Replaced it with a 72–112 px responsive clamp, controlled line height and a full-width text box. At 390 px, the title right edge is 354.67 px inside the 375 px content width. Post-fix evidence: `mobile-home-after-390.png`.
- [P2] Four tiny persistent navigation labels crowded the mobile header. Replaced them with one accessible Menu / Close control and a numbered four-item panel for Work, Life, Career and Contact. The control exposes `aria-expanded` and closes after a destination is selected. Post-fix evidence: `mobile-home-menu-open.png`.
- [P2] The first revised wide-mobile capture still had an oversized black gap below the portrait because the desktop viewport-height minimum remained active. Removed the mobile minimum height, allowed content to determine the section height and added a compact metadata strip below the image. Post-fix evidence: `mobile-home-after-wide.png`.
- [P2] Programmatic section jumps could take longer than the initial browser check because native smooth scrolling travels across a long story page. The shared jump helper now calculates the target page offset explicitly, and mobile-menu navigation waits for its exit transition before starting the jump.

### Required fidelity surfaces

- Fonts and typography: passed. Archivo remains the display face and Space Mono remains the supporting layer; the name, role, description and CTA now form a readable mobile hierarchy without overlap or truncation.
- Spacing and layout rhythm: passed. The mobile hero now follows header → identity → positioning → CTA → portrait → metadata → next section. Both tested widths have no horizontal overflow.
- Colors and visual tokens: passed. Near-black, warm white, muted gray and lavender match the desktop system and retain readable foreground contrast.
- Image quality and asset fidelity: passed. The real Firebase portrait remains in use with a deliberate grayscale crop; no placeholder, CSS drawing or generated substitute was introduced.
- Copy and content: passed. The name, role, product statement, CTA, location and destination labels are unchanged and remain available on mobile.

### Interaction and runtime verification

- Mobile Menu / Close toggle: passed.
- Work, Life, Career and Contact menu controls rendered with clear targets: passed.
- Menu closes before destination navigation: passed.
- Primary `View selected work` navigation: passed.
- Wide mobile, 390 px mobile and 1440 px desktop regression checks: passed.
- Runtime error overlay during viewport changes, menu open/close and navigation checks: none observed.
- Production build: passed; the only output is the existing Vite large-chunk advisory.

### Follow-up polish

- [P3] The mobile hero currently uses the same portrait crop as desktop. A future art-directed mobile crop could place slightly more shoulder space below the fold, but the present crop is balanced and sharp.

final result: passed

## Focused case-study legibility and scroll QA — 2026-08-04

### Evidence and normalization

- Source visual truth: `E:\WEB\mywebsitenotebook\audit-screenshots\case-study-overlap-before.png` (the user-supplied VR case-study screenshot).
- Browser-rendered implementation: `E:\WEB\mywebsitenotebook\audit-screenshots\case-study-overlap-after.png`.
- Desktop CSS viewport: 1440 × 1024 at device density 1; implementation capture: 1425 × 1013 pixels after scrollbar allowance.
- Source pixels: 2085 × 1941. For the combined review, the source was proportionally normalized to 1088 × 1013 and placed beside the 1425 × 1013 implementation.
- Full-view comparison evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\case-study-overlap-comparison.png` (2513 × 1013).
- Focused scroll-state evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\case-study-interaction-after.png`.
- Mobile evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\case-study-vr-mobile-after.png`; 390 × 844 CSS viewport, 375 × 812 captured pixels, density 1.
- Compared states: VR case-study hero at scroll origin, VR context/interaction state after scrolling, LILT hero, Baolu Route hero, and VR hero at the mobile breakpoint.

### Findings and comparison history

- [P1] The long VR title crossed its copy grid and was hidden behind the poster. Added a long-title class, constrained both grid children with `min-width: 0`, and introduced a compact display scale that wraps only within the copy column. Post-fix desktop geometry: title right 547.22 px, poster left 619.22 px, overlap false. Evidence: `case-study-overlap-comparison.png`.
- [P2] Metadata, captions and body copy were too small and low-contrast. Increased small UI text to 10–12 px, long-form copy to 18 px desktop, decision copy to 13 px, and raised neutral text contrast on both light and dark sections. Evidence: `case-study-overlap-after.png` and `case-study-interaction-after.png`.
- [P2] Scrolling only revealed content and did not communicate location or section changes. Added a continuous left progress bar, a clickable four-chapter rail, hero copy/poster counter-parallax, staggered content reveals and proximity snapping. Replaced progress-threshold chapter selection with section intersection tracking so short generic cases highlight the correct section. Post-fix click test: `Decisions` scrolled to 16.27 px from the modal top and remained active.
- [P2] Mobile needed a separate long-title treatment. At 390 px, the VR title resolves at 58.5 px, the chapter rail is hidden, the progress bar remains visible, and both document and modal stay within the 375 px content width. Evidence: `case-study-vr-mobile-after.png`.

### Required fidelity surfaces

- Fonts and typography: passed. Display text keeps the editorial Archivo voice while long titles use a controlled optical size; Space Mono labels and metadata are now readable without overwhelming the hierarchy.
- Spacing and layout rhythm: passed. Copy and poster remain separated by a 72 px desktop gutter; mobile stacks naturally with no horizontal overflow. Scroll anchors use consistent section margins and proximity snapping.
- Colors and visual tokens: passed. The warm-paper, ink, lavender and dark-section tokens are preserved; supporting copy now meets the intended visual contrast in both themes.
- Image quality and asset fidelity: passed. VR, LILT and Baolu Route continue to use their real project imagery and generated project posters; no placeholders or code-drawn substitutes were introduced.
- Copy and content: passed. Project-specific titles, roles, stacks, context, decisions and outcomes remain intact; no truncation was used to solve the layout problem.

### Interaction and runtime verification

- Continuous modal scroll progress: passed.
- Clickable Context / Interface / Decisions / Outcome navigation: passed.
- Intersection-based active chapter state on the shorter VR narrative: passed.
- Hero text/poster counter-parallax: passed.
- Staggered metric and narrative reveals: passed.
- LILT and Baolu Route desktop regression check: passed; both title/poster overlap checks returned false.
- VR mobile responsive check: passed; no horizontal overflow and chapter rail hidden as intended.
- Runtime error UI / Vite overlay during route changes, modal opens, scrolls and chapter clicks: none observed.
- Production build: passed; the only output is the existing Vite large-chunk advisory.

### Follow-up polish

- [P3] The generic VR project still has fewer project-specific gallery frames than LILT and Baolu Route. Additional process imagery would enrich the middle of the narrative but is not required for usability or visual integrity.

final result: passed

## Focused case-study redesign — 2026-08-04

### Evidence and normalization

- Source visual truth: `E:\WEB\mywebsitenotebook\audit-screenshots\case-study-before.png` — the previous generic LILT modal.
- Rendered implementation: `E:\WEB\mywebsitenotebook\audit-screenshots\case-study-lilt-top.png` and `case-study-route-top.png`.
- Desktop CSS viewport: 1440 × 1024 at density 1; captured content pixels: 1425 × 1013 after scrollbar allowance.
- Mobile CSS viewport: 390 × 844 at density 1; captured content pixels: 375 × 812 after scrollbar allowance.
- Full-view side-by-side evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\case-study-comparison.png`.
- Focused gallery evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\case-study-lilt-gallery.png`.
- Responsive evidence: `case-study-lilt-mobile.png`, `case-study-lilt-mobile-gallery.png`, and `case-study-route-mobile.png`.
- Compared state: `VIEW CASE STUDY` open at the top of the LILT and Baolu Route project narratives; gallery evidence uses the same LILT modal scrolled to `Product in use`.

### Findings and comparison history

- [P2] The previous modal opened with an oversized empty title block followed by one full-width poster; project context, product decisions and results were pushed below the fold and had no visual relationship to the product. Replaced it with a project-specific editorial hero, three-signal metric rail, context chapter, real-interface gallery, system-decision chapter and outcome footer. Post-fix evidence: `case-study-comparison.png`.
- [P2] The original generic structure gave LILT and Baolu Route identical visual treatment despite different product identities. Added project themes driven by the actual products: lavender/ink for LILT and forest-green/warm-paper for Baolu Route, while retaining the portfolio's Archivo/Space Mono hierarchy. Post-fix evidence: `case-study-lilt-top.png` and `case-study-route-top.png`.
- [P2] The original modal had no responsive case-study composition beyond stacking generic content. Added a dedicated mobile hero, one-column metrics, sequential media frames, mobile system decisions and a compact outcome footer. Post-fix evidence: `case-study-lilt-mobile.png` and `case-study-route-mobile.png`; layout returned `scrollWidth: 375` within a 390 px viewport.

### Required fidelity surfaces

- Fonts and typography: passed. Archivo remains the display family and Space Mono remains the information layer; headings, labels, statistics and long-form copy use distinct optical scales without truncation at tested breakpoints.
- Spacing and layout rhythm: passed. The desktop case study uses a deliberate hero → metrics → context → gallery → system → outcome rhythm. Mobile collapses to one column without horizontal overflow.
- Colors and tokens: passed. Both project themes use product-derived accents without changing the portfolio's paper, ink, rule and label system.
- Image quality and asset fidelity: passed. The LILT narrative uses live product screenshots and real landing illustrations; Baolu Route uses the real login page, 3D map and group-status screens. No placeholder imagery, handmade SVG or CSS art is used.
- Copy and content: passed. Each narrative now explains the product problem, approach, key decisions and outcome with project-specific details and working live-product links.

### Interaction and runtime verification

- `VIEW CASE STUDY` opens both project-specific narratives: passed.
- Modal scroll and in-view media/decision reveals: passed.
- Fixed close control: passed.
- Escape-key close: passed.
- Live-product destinations: LILT and Baolu Route links resolve to their configured URLs.
- Browser console errors: none.
- Browser console warnings: none.
- Production build: passed.

final result: passed
- Browser console errors: none.
- Browser console warnings: none.

final result: passed

## Focused life-chapter optimization — 2026-08-04

- Before: the portrait and hobby collages accumulated in the lower-right corner, leaving an oversized inactive center and pushing cooking/basketball below the viewport. The vertical personal timeline also competed with the fixed chapter rail.
- Fix: enlarged and recropped the portrait through a dedicated animated wrapper; regrouped photography, gaming, cooking and basketball into a balanced 2 × 2 orbit; converted the personal timeline into a low horizontal track; shortened the pinned scroll distance from 330vh to 270vh; reduced the hobby travel range so every card remains inside the viewport throughout the reveal.
- Desktop evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\life-section-after-desktop.png` at 1440 × 1024.
- Mobile evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\life-section-after-mobile.png` and `life-section-after-mobile-collage.png` at 390 × 844.
- Side-by-side visual review: `E:\WEB\mywebsitenotebook\audit-screenshots\life-section-comparison.png`; the comparison confirms that the inactive center has been replaced by a clear portrait-led focal point and that all four hobbies now resolve within one desktop frame.
- Post-fix desktop bounds: all four hobby cards remain fully visible at the start, midpoint and end of the pinned sequence; portrait ends above the timeline; no content crosses the fixed chapter rail.
- Post-fix mobile behavior: natural vertical reading is preserved, portrait scale is materially stronger, the four hobbies resolve into a compact 2 × 2 grid, and the timeline returns to a readable vertical format.
- Browser console errors: none.
- Browser console warnings: none.
- Production build: passed.

## Focused outcome-section redesign — 2026-08-04

### Evidence and normalization

- Source visual truth: `E:\WEB\mywebsitenotebook\audit-screenshots\outcome-section-before.png` (the user-supplied LILT outcome screenshot).
- Browser-rendered implementation: `E:\WEB\mywebsitenotebook\audit-screenshots\outcome-section-after-desktop.png`.
- Desktop CSS viewport: 1440 × 1024 at device density 1; implementation capture: 1425 × 1013 pixels after scrollbar allowance.
- Source pixels: 1971 × 1263. For the combined review, the source was proportionally normalized to 1581 × 1013 and placed beside the 1425 × 1013 implementation.
- Full-view comparison evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\outcome-section-comparison.png` (3006 × 1013).
- Mobile evidence: `E:\WEB\mywebsitenotebook\audit-screenshots\outcome-section-after-mobile.png`; 390 × 844 CSS viewport, 375 × 812 captured pixels, density 1.
- Compared state: LILT case study at `04 / Outcome`, aligned to the section start; Baolu Route was checked at the same state as a regression case.
- Focused region comparison was not needed because the full-view comparison keeps the headline, summary, three result signals, navigation and footer readable at review scale.

### Findings and comparison history

- [P1] The previous outcome was a single 72 px paragraph spanning most of the viewport. Its long lines, aggressive wrapping and uniform weight made the conclusion difficult to scan. Replaced it with a short display statement and a 17–22 px Space Mono summary in a two-column hierarchy. Post-fix evidence: `outcome-section-comparison.png`.
- [P2] The previous composition stated the result but did not expose outcome evidence. Added three project-specific signals—daily direction, connected progress and long-term goal—with staggered in-view motion. Post-fix evidence: `outcome-section-after-desktop.png`.
- [P2] The initial revised desktop capture extended the project footer below the 1440 × 1024 viewport. Reduced vertical padding, section gaps and signal-row height; the final section now measures exactly 1024 px and the footer ends at 1002 px. Post-fix evidence: `outcome-section-after-desktop.png`.
- [P2] Mobile needed a natural reading order rather than a compressed desktop grid. The title, summary and result signals now stack sequentially; the document remains 375 px wide inside a 390 px viewport with no horizontal overflow. Post-fix evidence: `outcome-section-after-mobile.png`.

### Required fidelity surfaces

- Fonts and typography: passed. Archivo retains the editorial display voice while the explanatory text uses a readable Space Mono size and line height. Heading and body no longer compete at the same optical scale.
- Spacing and layout rhythm: passed. The desktop section resolves inside one viewport with clear headline, explanation, evidence and footer bands. Mobile uses a deliberate vertical sequence without clipping.
- Colors and visual tokens: passed. Warm paper, ink and LILT lavender remain unchanged; the new hierarchy is created through scale, rules and controlled neutral opacity.
- Image quality and asset fidelity: passed. This outcome section contains no source imagery, so no assets were replaced or approximated.
- Copy and content: passed. The original outcome meaning is preserved, while the new short headline and three signals make the result easier to understand.

### Interaction and runtime verification

- Outcome chapter navigation and active state: passed.
- Scroll-aligned outcome entry: passed.
- Staggered headline, summary and signal reveals: passed.
- Live-project link remains present with hover feedback: passed.
- LILT desktop and mobile responsive checks: passed.
- Baolu Route shared-component regression check: passed; title and summary columns do not overlap.
- Runtime error overlay during route changes, modal open/close, chapter jumps and responsive resizing: none observed.
- Production build: passed; the only output is the existing Vite large-chunk advisory.

### Follow-up polish

- [P3] The outcome signals are intentionally qualitative because verified product analytics were not available. Confirmed usage or learning metrics could replace them later without changing the layout.

final result: passed
