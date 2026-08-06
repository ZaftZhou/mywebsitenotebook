# Portfolio project thumbnail QA

## Evidence

- Source visual truth: `C:\Users\z3756\AppData\Local\Temp\codex-clipboard-221997d1-e87c-40c6-90b3-96e038bf4ce5.png`
- Browser-rendered implementation: `E:\WEB\mywebsitenotebook\tmp\design-qa\portfolio-thumbnails-fixed-desktop.png`
- Normalized side-by-side comparison: `E:\WEB\mywebsitenotebook\tmp\design-qa\portfolio-thumbnails-before-after.png`
- All five project states: `E:\WEB\mywebsitenotebook\tmp\design-qa\portfolio-thumbnails-all-fixed.png`
- Mobile evidence: `E:\WEB\mywebsitenotebook\tmp\design-qa\portfolio-thumbnails-fixed-mobile.png`
- Route: `http://127.0.0.1:4175/`

## Capture normalization

- Source pixels: 3546 × 1707.
- Implementation pixels: 2033 × 980.
- Desktop CSS viewport: 2048 × 987 at 1× density; browser content capture excludes the scrollbar/chrome area.
- The source was downsampled and center-fitted to 2033 × 980 before the side-by-side comparison. No implementation image was upscaled for judgment.
- Mobile CSS viewport: 390 × 844 at 1× density.
- State: VINCE Avatar System project chapter, centered sticky-scroll position.

## Findings

- [Resolved P1] The project artwork was cropped and enlarged beyond recognition.
  - Location: `.story-project-image img` and the desktop poster/slice variants in `src/vertical-portfolio.css`.
  - Evidence: the source screenshot shows only a cropped portion of the 387 × 165 VINCE image. The implementation comparison shows the complete logo, icon, divider, title, and subtitle.
  - Impact: visitors could not identify project covers and text embedded in poster artwork became unreadable.
  - Fix: changed project artwork to `object-fit: contain`, centered it, removed the 43% poster clip, and converted the slice crop into an explicit uncropped frame.
- No actionable P0/P1/P2 issues remain.

## Fidelity surfaces

- Fonts and typography: project title, metadata, body copy, and CTA are unchanged; line wrapping remains stable at desktop and mobile sizes.
- Spacing and layout rhythm: the existing five chapter compositions remain intact. Letterboxing is intentional where source aspect ratios do not match the animated frame.
- Colors and tokens: existing ink, paper, coral, purple, and blue tokens are unchanged. Empty frame space uses the established `--story-panel` surface.
- Image quality and asset fidelity: all five original project assets are used without replacement or distortion. VINCE is still limited by its 387 × 165 source resolution, but containing it reduces the previous destructive enlargement and preserves the complete artwork.
- Copy/content: no project names, descriptions, metadata, or case-study content changed.
- Icons: existing Lucide navigation and CTA icons are unchanged.

## Responsive and interaction checks

- Verified all five homepage project chapters use `object-fit: contain` and completed image loads.
- Verified the VINCE poster container has `clip-path: none` on desktop.
- Verified document horizontal overflow is absent at 2048 × 987 and 390 × 844.
- Verified five project chapters remain present.
- Verified sticky scroll, project CTA, chapter rail, and mobile menu remain rendered.
- Browser console errors checked: 0 errors during the desktop and mobile checks.
- Production build: passed with Vite.

## Focused comparison

The before/after image is the focused VINCE comparison. The five-project contact sheet provides a second focused pass across square, portrait, landscape, screenshot, and photographic cover formats. These views make crop and aspect-ratio behavior readable without relying on the full page.

## Comparison history

- Iteration 1: P1 crop found. `object-fit: cover` enlarged a 387 × 165 source into a tall frame, while the poster layout clipped the left 43% of the frame.
- Fix: switched homepage project imagery to contain, centered the media, removed the poster clip, and retained the same chapter geometry.
- Iteration 2: desktop and mobile captures show complete artwork; all five source aspect ratios remain recognizable and no P0/P1/P2 issue remains.

## Implementation checklist

- [x] Preserve complete project artwork.
- [x] Remove desktop poster/slice clipping.
- [x] Verify all five featured projects.
- [x] Verify mobile behavior and horizontal overflow.
- [x] Verify build and browser console.

final result: passed
