# Notebook Website Design System

This document is the source of truth for future page generation and interface changes. New pages, admin screens, tools, and UI edits must follow this visual language unless a task explicitly asks for a different art direction.

## 1. Color Palette: Warm, Paper-Like, Restrained

- Background: `#FAF9F6` Beigey Off-white. Avoid pure white as the global page background. Use this warm paper color to create a soft, physical, editorial feeling.
- Text: `#1C1C1C` Ink black. Prefer deep ink-gray over harsh pure black. It should remain highly readable while feeling refined.
- Accent: `#D06950` Terracotta / brick red. Use this sparingly for focus states, hover accents, active navigation, small tags, and visual emphasis. It should add life without dominating the page.
- Supporting tones should stay muted, warm, and natural. Avoid neon colors, cold corporate blues as a dominant theme, and heavy gradient backgrounds.

## 2. Whitespace: Generous Breathing Room

- Layouts should feel like a well-typeset independent magazine, not a dense dashboard.
- Use generous negative space between major sections. Large vertical rhythm such as `pt-40`, `gap-24`, and spacious line-height is appropriate for public pages.
- Section transitions should include visible pauses: soft separators, rounded indicator lines, and enough top/bottom breathing room.
- Admin and tool screens may be denser than the homepage, but they still need clear grouping, calm spacing, and uncluttered primary actions.

## 3. Typography: Strong Hierarchy, Fine Detail

- Display headings use Outfit. Large headings such as `text-7xl` and `text-8xl` can act as visual graphics.
- Body copy uses Inter for clean, restrained readability.
- Micro labels use very small uppercase text, usually `text-[10px]`, `uppercase`, and `tracking-widest` or wider. Use these for metadata, categories, status text, and secondary labels.
- Avoid decorative typography for functional controls. Let scale, spacing, and hierarchy carry the design.

## 4. Interface Elements: Rounded, Light, Editorial

- Use rounded forms generously: `rounded-full`, `rounded-2xl`, `rounded-[28px]`.
- Prefer translucent cards, warm paper panels, low-opacity ink borders like `border-ink/10`, and `backdrop-blur`.
- Avoid heavy shadows and hard boxes. Use light floating treatment and subtle borders to define space.
- Buttons should feel tactile but restrained. Primary actions can use ink-filled pills; secondary actions should be pale, bordered, and calm.
- Avoid dense nested cards. Group content with whitespace, soft panels, and editorial sectioning.

## 5. Motion: Smooth, Physical, Delicate

- Use Framer Motion / Motion for page and section transitions when practical.
- Prefer smooth opacity, slight Y movement, and gentle scale changes over abrupt state changes.
- Use considered easing such as `ease: [0.76, 0, 0.24, 1]`.
- Hover interactions should be subtle: slow image scale, small lift, soft border/accent changes.
- Motion should communicate polish and physical feedback, not distract from content.

## Implementation Rule

Before adding or changing UI, check the result against these five principles: warm restrained color, generous whitespace, strong typographic hierarchy, rounded lightweight elements, and smooth physical motion.
