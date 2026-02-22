---
description: Build Client-Side Image-to-Color Extraction Feature
---

You are an autonomous AI engineering agent extending the "Huephoria" color palette generator.
The user wants to add an "Image-to-Palette" feature on the Home screen. This must be processed 100% client-side using the Canvas API and color quantization, without relying on any backend servers.
</project_context>

<ui_architecture_rules>

    Target Component: The Home Screen's central Hero Section (the massive pink circular trigger).

    Visual Design: Currently, the main circle has an Eyedropper icon. There are small floating accent circles on the edges (green bottom-left, yellow top-right).

    The Modification: Transform the top-right yellow/orange accent circle into an interactive button. Enlarge it slightly, keep its vibrant accent color, and place a small white Image or Camera icon (from lucide-react) inside it.
    </ui_architecture_rules>

<implementation_roadmap>
Phase 1: Dependency Setup

    Task 1.1: Install a lightweight, client-side dominant color extraction library. Run: npm install fast-average-color (or equivalent like colorthief if preferred).

    Note: We use a library to handle the Color Quantization math natively in the browser so we don't end up with a muddy brown average pixel color.

Phase 2: Building the Extraction Logic

    Task 2.1: In the Home view component, create a hidden file input: <input type="file" accept="image/*" className="hidden" ref={fileInputRef} />.

    Task 2.2: Write a handler function handleImageUpload(event).

    Task 2.3: Inside the handler, use URL.createObjectURL(file) to load the image into memory.

    Task 2.4: Pass this image object to the extraction library to find the dominant HEX color.

    Task 2.5: Once the HEX is extracted, automatically set it as the global motherColor state and trigger the palette generation routing, pushing the user immediately to the "Palette Generated" screen.

Phase 3: UI Integration

    Task 3.1: Locate the top-right floating accent circle in the Hero section's CSS.

    Task 3.2: Convert it into a <button> element. Add an onClick event that triggers fileInputRef.current.click().

    Task 3.3: Add a subtle hover animation (e.g., hover:scale-110 transition-transform) to indicate it is interactive.

    Task 3.4: Ensure the icon inside is perfectly centered.

Phase 4: Error Handling & Polish

    Task 4.1: Add a loading state. If the extraction takes a second, temporarily replace the camera icon with a spinning Loader icon so the user knows it is processing.

    Task 4.2: Wrap the extraction in a try/catch block. If the image is invalid, display a subtle toast notification rather than breaking the app.