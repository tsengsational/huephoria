---
description: Huephoria Existing Codebase Update and Feature Injection Plan
---

<project_context>
You are an autonomous AI engineering agent tasked with updating an existing codebase for a color palette generator app.

The user has already built a foundational version of this app. Your objective is to audit the existing code, refactor the UI to strictly match the provided visual design system, and completely swap out the underlying color engine for a highly advanced, OKLCH-based 36-color matrix generator.
</project_context>

<ui_architecture_rules>

    Aesthetic: "Soft Pop" Light Mode.

    Backgrounds: Off-white/Light Gray (bg-gray-50).

    Cards: White backgrounds, highly rounded corners (rounded-3xl), and soft drop shadows (shadow-sm).

    Primary Actions: Vibrant Fuchsia/Hot Pink gradients (e.g., bg-pink-500 to bg-pink-600).
    </ui_architecture_rules>

<implementation_roadmap>
Phase 1: Codebase Audit & Dependency Injection

    Task 1.1: Scan the existing repository to understand the current routing, state management, and component hierarchy.

    Task 1.2: Install necessary dependencies for the upgrade: colord or colorjs.io (for OKLCH math), a naming library like namer, and expo-sharing (if React Native) for handling file exports.

    Task 1.3: Clean up legacy RGB/HSL generation logic to prepare for the engine swap.

Phase 2: UI Refactor - View A (Home / Input Screen)

Based on the provided "Create your vibe" screenshot.

    Task 2.1: Update the Header to show the Logo text (left) and a User Avatar icon (right).

    Task 2.2: Build the Hero Section. Implement a massive, decorative pink circular container. Inside the circle, place a smaller pink circle with a white "Eyedropper" icon. Add small, floating accent circles (e.g., green bottom-left, yellow top-right) overlapping the main circle's edge. This cluster is the trigger for the color picker.

    Task 2.3: Add the primary CTA below the hero: A full-width, heavily rounded button reading "Generate Palette" with a hot pink background.

    Task 2.4: Build the "Trending Palettes" feed. Create a vertical scroll list of white cards. Each card must contain: A user avatar and title (e.g., "Nordic Sunset"), a 3-dot menu, and a horizontal row of 5 conjoined color swatches taking up the bottom half of the card.

    Task 2.5: Ensure the bottom navigation bar has 4 tabs: Home (active, pink house icon), Saved (heart), Explore (compass), and Settings (gear).

Phase 3: UI Refactor - View B (Palette Generated Screen)

Based on the provided "Palette Generated" screenshot.

    Task 3.1: Update the Header to include a Back arrow (left), "Palette Generated" title, and 3-dot menu (right).

    Task 3.2: Build the "MOTHER COLOR" section. This must be a large, dominant top card. The card's background is the selected color. Inside, display the Hex Code (large text), the color's name (e.g., "Vibrant Fuchsia"), and a white pill-shaped "Copy" button.

    Task 3.3: Build the "HARMONIOUS TONES" Bento Grid using CSS Grid. The layout must match this exact asymmetry:

        Column 1 (Left): One large square at the top, and two smaller squares side-by-side beneath it.

        Column 2 (Right): One tall vertical rectangle spanning the height of the left column's squares.

        Bottom Row: One wide horizontal rectangle spanning both columns (labeled "HIGHLIGHT").

    Task 3.4: Build the action footer. Implement a primary "Save to Collection" button (Solid Pink, full width). Below it, add a two-column row with "Export" (upload icon) and "Regenerate" (refresh icon) outlined buttons.

Phase 4: The 36-Color OKLCH Matrix Engine

    Task 4.1: Write a new utility function generateMatrix(rootHex). Convert the input to the OKLCH color space.

    Task 4.2: Generate a 9x4 matrix (36 colors). Create the main "Spine" (9 colors) by decreasing lightness and increasing chroma for shadows (shifting hue right), and increasing lightness and decreasing chroma for highlights (shifting hue left).

    Task 4.3: Duplicate and adjust the Spine to create 4 total rows: Highlights, Muted, Base Spine, and Deep Shadows.

    Task 4.4: Write the selection logic to automatically pick 5 colors from this 36-color array to populate the Mother Color slot and the 4 Harmonious Tones slots in the Bento Grid.

Phase 5: Professional Exports Integration

    Task 5.1: Wire up the "Export" button to trigger a share sheet or download.

    Task 5.2: Implement .swatches generation for Procreate. Construct a JSON object mapping the 5 active HSL/HSB values and zip/export it.

    Task 5.3: Implement W3C Design Tokens export. Generate a JSON file where the 5 colors are formatted with standard $value and $type syntax.

</implementation_roadmap>