---
description: Build Partial Freezing (locking) Feature for the Color Palette
---

<project_context>
You are an autonomous AI engineering agent extending the "Palettable" color palette app.
The user wants to add a "Partial Freezing" feature to the "Palette Generated" screen. Users should be able to lock specific colors in the Bento Grid so that when they press the "Regenerate" button, only the unlocked colors are replaced with new selections from the color matrix.
</project_context>

<ui_architecture_rules>

    Target View: The Results View ("Palette Generated" screen with the Bento Grid).

    The Lock Icon: Use the Lock and Unlock icons from lucide-react.

    Placement: Position the icon in the top-right corner of every color card (the Mother Color card and the 4 Harmonious Tones cards).

    Aesthetic: Keep it minimal. If unlocked, the icon should be slightly transparent (opacity-50) or use the Unlock variant. If locked, it should be fully opaque (opacity-100) and use the solid Lock variant.
    </ui_architecture_rules>

<implementation_roadmap>
Phase 1: State Management

    Task 1.1: In the component managing the "Palette Generated" view, introduce a new state object to track locked slots:
    const = useState({ 0: false, 1: false, 2: false, 3: false, 4: false }).

    Task 1.2: Create a toggle function toggleLock(index) that flips the boolean value for a specific slot.

Phase 2: UI Integration (The Bento Grid)

    Task 2.1: Iterate through the 5 UI slots (Mother Color at the top, the Tall Vertical card, the two Small Squares, and the Wide Horizontal strip).

    Task 2.2: Add an absolutely positioned <button> containing the Lucide lock icon to the top-right corner of each card's container.

    Task 2.3: Bind the onClick event of each lock button to toggleLock(index).

    Task 2.4: Ensure the icon color dynamically contrasts with its background (e.g., use white text if the background color is dark, and dark text if the background is light).

Phase 3: The Regeneration Logic

    Task 3.1: Locate the onClick handler for the "Regenerate" button (the white outlined button at the bottom of the screen).

    Task 3.2: Modify the regeneration logic. When generating a new palette (or picking new colors from the 36-color OKLCH matrix), apply a map/filter:

        Logic: newPalette[i] = lockedSlots[i]? currentPalette[i] : generatedColors[i]

    Task 3.3: Ensure that if the "Mother Color" (Slot 0) is unlocked and regenerated, the underlying 36-color matrix is completely recalculated based on the new random Mother Color, but any locked Harmonious Tones are forcefully injected back into their respective slots in the final output array.

Phase 4: Polish

    Task 4.1: Add a subtle scaling animation (active:scale-95) to the lock icons when clicked to provide tactile feedback.