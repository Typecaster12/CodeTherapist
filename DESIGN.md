# DESIGN.md — LINEAR SPECIFICATION FOR CODE THERAPIST

This document governs the entire visual architecture, style primitives, token hierarchies, and component layouts for Code Therapist. All generated components, layouts, and styles MUST strictly adhere to these design directives.

---

## 1. Visual Theme & Atmosphere
- **Mood:** Opinionated Calm, Surgical Precision, Therapeutic Structure.
- **Canvas Type:** Deep Void Dark Mode (Strictly no light mode variants).
- **Density:** High-density, data-rich but balanced with deliberate whitespace. 
- **Visual Texture:** Sharp borders, subtle inner glows, micro-gradients, and custom scrollbars.

---

## 2. Color Palette & Semantic Roles (Tailwind-Mapped)

All UI elements must utilize these exact hex tokens. Do not introduce raw or generic Tailwind color shades (`gray-500`, etc.).

### Primitives (The Grayscale)
- `--bg-void`: `#080710` (Main viewport background)
- `--bg-surface`: `#12111a` (Primary card and panel backgrounds)
- `--bg-surface-elevated`: `#1a1926` (Dropdowns, modals, popovers)
- `--border-subtle`: `#1f1e2e` (Default divider and subtle structural borders)
- `--border-muted`: `#2d2b3f` (Interactive borders for inputs, buttons, and state changes)
- `--border-focus`: `#8b8a96` (Active state highlight - overridden to muted per user)

### Semantic Accents
- `--text-primary`: `#f7f7f8` (High contrast text)
- `--text-secondary`: `#b4b3c0` (Labels, paragraphs, description text)
- `--text-muted`: `#686775` (Placeholders, disabled elements, dates)
- `--accent-purple`: `#8b8a96` (Overridden to muted per user - focus rings)
- `--accent-glow`: `rgba(255, 255, 255, 0.05)` (Subtle box shadows)

### Diagnostic Categories (Categorical Pill Palette)
*Note: Overridden to monochrome/desaturated per user request "no vibrant color should be used".*
- `Syntax Error`: `#8a8a8a`
- `Logic Error`: `#808080`
- `Conceptual Gap`: `#757575`
- `Architecture Issue`: `#6b6b6b`
- `Tooling Problem`: `#616161`
- `Debugging Skill Gap`: `#575757`
- `Overengineering`: `#4d4d4d`
- `Burnout`: `#424242`

---

## 3. Typography & Hierarchy

- **Primary Font Family:** `Inter`, system-ui, sans-serif (Tracking: `-0.02em` for headings, `-0.01em` for body).
- **Code Font Family:** `JetBrains Mono`, `Fira Code`, monospace (For syntax blocks and stack traces).

### Font Scale
- `Display Title (H1)`: `24px` | SemiBold (600) | Line-height: `32px` | Primary Text
- `Section Title (H2)`: `18px` | Medium (500) | Line-height: `24px` | Primary Text
- `Card Heading (H3)`: `14px` | Medium (500) | Line-height: `20px` | Primary Text
- `Body Text`: `13px` | Regular (400) | Line-height: `18px` | Secondary Text
- `Micro Text / Labels`: `11px` | Medium (500) | Mono or Sans | Muted Text

---

## 4. Spacing, Layout & Grids

- **Base Unit:** `4px` fluid scale (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).
- **App Wrapper:** Full viewport width (`w-screen`), absolute height constraint (`h-screen`), overflow hidden on the main wrapper. Individual view sections scroll independently via explicit inner containers.
- **Main Shell Grid:** Left Navigation Bar (`w-60` or `w-16` collapsed) + Main Component Canvas (flex-1).
- **Card Padding:** Always `24px` (p-6) for large diagnostic screens; `16px` (p-4) for lists, rows, and sidebar menus.

---

## 5. UI Primitives & Interactive Elements

### Buttons & Inputs
- **Base Button Style:** `h-8` or `h-9` padding-x: `12px`, `rounded-md`, border: `1px solid var(--border-muted)`, bg: `var(--bg-surface)`, transition: `all 150ms ease`.
- **Primary Call-to-Action (Submit Form):** `bg-[var(--accent-purple)]`, text: `white`, hover: custom brightness enhancement, shadow: `0 0 12px var(--accent-glow)`.
- **Text Inputs / Select Fields:** `bg-void`, border: `1px solid var(--border-subtle)`, text: `var(--text-primary)`, text-size: `13px`. Focus rule: `border-[var(--border-focus)] outline-none ring-1 ring-[var(--border-focus)]`.

### Panels & Containment Cards
- **Card Component:** `bg-[var(--bg-surface)]`, border: `1px solid var(--border-subtle)`, `rounded-lg`, overflow hidden.
- **Subtle Inner Glow Pattern:** Cards should feature a microscopic top border highlights (`border-t-[1px] border-t-white/[0.03]`).

---

## 6. Structural View Component Outlines (The Core App Layout)

Stitch must assemble the platform into 3 distinct operational view layouts using these explicit specifications:

### Layout A: The Form Canvas ("Diagnose View")
- **Layout Matrix:** `grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-64px)] p-6`
- **Left Column (cols-5):** Simple, structured stack of clean input rows (Framework, Time spent, Emotion, What they were building). No decorative iconography; use minimal border text fields.
- **Right Column (cols-7):** Large, dedicated Monospace Terminal view for the user's `Code Snippet` and `Error Message`. Give it a solid black header mimicking a terminal frame with file context metrics.

### Layout B: The Diagnostic Output ("Results View")
- **Layout Matrix:** Vertical stack with asymmetric grid rows.
- **Top Row (Hero Diagnosis Banner):** 
  - Left: Display the diagnosed main category string using huge, bold tracking (`text-2xl font-semibold text-[var(--text-primary)]`).
  - Right: Display a precise Circular Progress Ring/Gauge showing the classification confidence percentage (`text-[var(--accent-purple)]`).
- **Bottom Row (The Prescription Blocks):**
  - An clean architectural grid containing 4 separate callout zones with subtle left-accented colored borders (`border-l-2`). 
  - Each block isolates: 1. *Why You're Stuck* | 2. *Immediate Action Step* | 3. *Study Syllabus* | 4. *Prevention Guardrails*.
  - No raw markdown spills; content inside must read elegantly with crisp `line-height` and high structural padding.

### Layout C: The Analytical Overview ("Dashboard View")
- **Layout Matrix:** Asymmetric analytical dashboard grid (`grid grid-cols-12 gap-4`).
- **Card 1 (cols-8):** Line chart showing "Weekly Diagnosis Trends" over time.
- **Card 2 (cols-4):** Donut Chart visualization mapping "Most Common Struggle Categories" using the explicit Diagnostic Colors palette.
- **Card 3 (cols-4):** Horizontal Bar chart mapping "Technology Blocker Distribution" (e.g., React vs Node).
- **Card 4 (cols-8):** Custom Data Table showcasing historic session tracking logs with rows featuring a faint fade-on-hover interaction (`hover:bg-white/[0.02]`).

---

## 7. Data Visualization Style (Recharts Presets)
- All custom charts must render transparently without default white borders.
- **Grid Lines:** `stroke="var(--border-subtle)" strokeDasharray="3 3"`
- **Tooltips:** Custom HTML element styled with `bg-[var(--bg-surface-elevated)] border border-[var(--border-muted)] rounded-md text-[12px] text-[var(--text-primary)] p-2 shadow-xl`.
- **Chart Fills:** Use subtle vertical opacity gradients fading into transparent `#00000000` rather than solid flat colors.

---

## 8. Explicit Prohibitions & Anti-Patterns

- **NO Chat Bubble Elements:** Code Therapist is an analytical diagnostic engine, not a personal AI chat assistant. Do not generate message bubbles, avatars, or standard user/bot chat blocks.
- **NO Generic Light Backgrounds:** Under no condition should a surface resolve to any shade of white, silver, or light gray.
- **NO Heavy Rounded Corners:** Maintain tight, modern structure. Maximum card rounding is `8px` (`rounded-lg`). Buttons and inputs are locked to `6px` (`rounded-md`).
- **NO Empty Fallbacks:** If a section or database log field is empty, render a bespoke Linear-styled dashed boundary box (`border-dashed border-2 border-[var(--border-subtle)]`) accompanied by a minimal monochrome empty-state label.
