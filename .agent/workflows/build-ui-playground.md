---
description: Build the Live UI Component Playground Feature
---

<project_context>
You are an autonomous AI engineering agent extending the "Huephoria" color palette generator.
The user wants to add a "Playground Mode" to the "Palette Generated" screen. This mode will allow users to toggle between viewing the raw color blocks (the Bento Grid) and a realistic mockup of SaaS UI components that are dynamically styled using their newly generated color palette.
</project_context>

<ui_architecture_rules>

    Design System: The app uses a "Soft Pop" Light Mode aesthetic (bg-gray-50, rounded-3xl cards, soft shadows).

    The Toggle: Place a sleek Segmented Control or Toggle Switch directly above the Harmonious Tones grid. Options: "Palette View" (Icon: Grid) and "UI Preview" (Icon: Layout/Monitor).

    Mockup Container: The UI Preview should be contained within a beautifully styled, padded card (bg-white, rounded-3xl, shadow-sm) to look like a "window" into a fake app.
    </ui_architecture_rules>

<implementation_roadmap>
Phase 1: State & Toggle Setup

    Task 1.1: In the "Palette Generated" view component, introduce a new state variable: const [viewMode, setViewMode] = useState<'grid' | 'ui'>('grid').

    Task 1.2: Build a toggle UI above the color results. Ensure the active state uses the pink brand gradient, and the inactive state is a muted gray.

    Task 1.3: Set up conditional rendering so that if viewMode === 'grid', the existing Bento Grid displays. If viewMode === 'ui', it renders a new <UIPlayground /> component.

Phase 2: Dynamic Theme Injection Engine

    Task 2.1: Create a new component file: UIPlayground.tsx (or .jsx).

    Task 2.2: Accept the 5 selected colors (Mother Color + 4 Harmonious Tones) as props.

    Task 2.3: Map these colors to CSS variables dynamically on the root div of the UIPlayground component using inline styles.

        Mapping Logic:

            --mock-primary: The Mother Color.

            --mock-bg: The lightest/neutral harmonious tone.

            --mock-surface: Pure white or a very light tint of the mother color.

            --mock-text: The darkest/contrast harmonious tone.

            --mock-accent: The pop/vibrant harmonious tone.

Phase 3: Building the Mock UI Components

    Task 3.1: Inside the UIPlayground wrapper, build a mini "SaaS Dashboard" layout using Tailwind classes that reference the custom variables (e.g., bg-[var(--mock-bg)], text-[var(--mock-text)]).

    Task 3.2: Mock Sidebar/Nav: Create a slim vertical sidebar with 3 dummy icon links (use lucide-react) and a user avatar.

    Task 3.3: Mock Header: Add a simple header with a "Welcome back" title and a primary CTA button (e.g., "Create New"). The button must use --mock-primary as its background and have a hover state.

    Task 3.4: Mock Data Cards: Build a 2-column grid of metrics cards (using --mock-surface). Include dummy data, a small badge/pill (using --mock-accent with low opacity), and a mini progress bar or sparkline to show off the accent colors.

    Task 3.5: Contrast Testing: Ensure the typography inside the mockup utilizes the darkest color for headings and a slightly muted version of it for body text to prove real-world legibility.

Phase 4: Polish & Review

    Task 4.1: Add a smooth framer-motion or standard CSS transition so switching between the Bento Grid and the UI Playground fades elegantly rather than snapping harshly.

    Task 4.2: Ensure the mockup is fully responsive, stacking into a single column on mobile devices.