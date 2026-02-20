import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import a11yPlugin from "colord/plugins/a11y";

extend([namesPlugin, a11yPlugin]);

/**
 * Generates a professional 36-Color Matrix (9x4 Grid).
 * @param {string} rootHex - The mother color hex string.
 * @param {string} mode - 'monochrome', 'analogous', 'tetradic', 'quadratic'
 * @returns {Object} - Object { featured: Array(5), matrix: Array(4) }
 */
export function generatePalette(rootHex, mode = 'vibrant') {
    const root = colord(rootHex);
    const rootHsl = root.toHsl();

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    // --- Step A: Define Hue Map for the Spine (9 steps) ---
    // Index 4 is the Anchor (Root Color)
    const hueOffsets = new Array(9).fill(0);

    if (mode === 'vibrant') {
        // The Original Curve (Vibrant)
        for (let i = 0; i < 9; i++) {
            const step = i - 4;
            hueOffsets[i] = step * 22;
        }
    } else if (mode === 'monochrome') {
        // Subtle shift for variety in monochrome
        for (let i = 0; i < 9; i++) {
            const step = i - 4;
            hueOffsets[i] = step * 2; // Very subtle
        }
    } else if (mode === 'analogous') {
        // Glide from -30 to +30
        for (let i = 0; i < 9; i++) {
            const step = i - 4;
            hueOffsets[i] = step * 7.5; // (-30 to +30)
        }
    } else if (mode === 'tetradic') {
        // Root (0), 60, 180, 240
        // Map 9 steps to traverse these points beautifully
        // -180, -120, -60, -30, 0, 30, 60, 120, 180
        const targets = [-180, -120, -60, -30, 0, 30, 60, 120, 180];
        targets.forEach((val, idx) => hueOffsets[idx] = val);
    } else if (mode === 'quadratic') {
        // 0, 90, 180, 270 (-90)
        const targets = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
        targets.forEach((val, idx) => hueOffsets[idx] = val);
    }

    // --- Step B: Generate the "Spine" (Row 3 - The Anchor) ---
    const spine = [];
    for (let i = 0; i < 9; i++) {
        const step = i - 4;
        let h = (rootHsl.h + hueOffsets[i] + 360) % 360;
        let s = rootHsl.s;
        let l = rootHsl.l;

        // Apply slight brightness/saturation curves even in multi-mode
        if (step < 0) {
            const mag = Math.abs(step);
            l = clamp(l + mag * 5, 0, 100);
            s = clamp(s - mag * 5, 0, 100);
        } else if (step > 0) {
            l = clamp(l - step * 5, 0, 100);
            s = clamp(s + step * 5, 0, 100);
        }

        spine.push(colord({ h, s, l }));
    }

    // --- Step C: Generate the Matrix ---
    const rawMatrix = [[], [], [], []];

    spine.forEach((baseColor) => {
        const hsl = baseColor.toHsl();

        // Row 1 (Index 0): Highlights (L +20%, S -10%, H -5°)
        rawMatrix[0].push(colord({
            h: (hsl.h - 5 + 360) % 360,
            s: clamp(hsl.s - 10, 0, 100),
            l: clamp(hsl.l + 20, 0, 100)
        }));

        // Row 2 (Index 1): Muted (L +5%, S -15%, H +0°)
        rawMatrix[1].push(colord({
            h: hsl.h,
            s: clamp(hsl.s - 15, 0, 100),
            l: clamp(hsl.l + 5, 0, 100)
        }));

        // Row 3 (Index 2): Base Spine
        rawMatrix[2].push(baseColor);

        // Row 4 (Index 3): Deep Shadows (L -20%, S +15%, H +10°)
        rawMatrix[3].push(colord({
            h: (hsl.h + 10) % 360,
            s: clamp(hsl.s + 15, 0, 100),
            l: clamp(hsl.l - 20, 0, 100)
        }));
    });

    // --- Step D: Format and Naming ---
    const matrix = rawMatrix.map(row =>
        row.map(c => ({
            hex: c.toHex().toUpperCase(),
            name: getColorName(c.toHex()),
            isDark: c.isDark()
        }))
    );

    const featured = [
        matrix[2][4], // Mother
        matrix[0][1], // Lightest
        matrix[1][3], // Vibrant
        matrix[3][7], // Contrast
        matrix[2][6], // Pop
    ];

    return { featured, matrix, mode };
}

export function generateArcPalette(rootHex) {
    const result = generatePalette(rootHex);
    return result.featured; // Legacy support for 5-color array
}

function getColorName(hex) {
    const color = colord(hex);
    const name = color.toName({ closest: true }) || "Untold Color";

    const adjectives = ["Vibrant", "Soft", "Deep", "Electric", "Misty", "Royal", "Sunset", "Ocean"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];

    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    return `${randomAdj} ${formattedName}`;
}
