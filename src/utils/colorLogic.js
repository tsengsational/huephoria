import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import a11yPlugin from "colord/plugins/a11y";
import lchPlugin from "colord/plugins/lch"; // colord has LCH plugin which is close to OKLCH but not same.
// For true OKLCH we might need another approach, but I'll stick to a robust perceptually uniform approach using colord's tools.

extend([namesPlugin, a11yPlugin, lchPlugin]);

/**
 * Generates an advanced 36-Color Matrix (9x4 Grid) using OKLCH-inspired logic.
 * @param {string} rootHex - The mother color hex string.
 * @param {string} mode - 'vibrant', 'monochrome', 'analogous', 'tetradic', 'quadratic'
 * @returns {Object} - Object { featured: Array(5), matrix: Array(4) }
 */
export function resolveColorInfo(hex) {
    const c = colord(hex);
    return {
        hex: c.toHex().toUpperCase(),
        name: getColorName(c.toHex()),
        isDark: c.isDark()
    };
}

export function getRandomVibrantColor() {
    return colord({
        h: Math.floor(Math.random() * 360),
        s: 70 + Math.random() * 20,
        l: 55 + Math.random() * 10
    }).toHex().toUpperCase();
}

export function generatePalette(rootHex, mode = 'vibrant') {
    const root = colord(rootHex);
    // Convert to LCH for perceptual uniformity (Lightness, Chroma, Hue)
    const rootLch = root.toLch();

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    // --- Step A: Define Hue Map for the Spine (9 steps) ---
    // Index 4 is the Anchor (Root Color)
    const hueOffsets = new Array(9).fill(0);

    if (mode === 'vibrant') {
        for (let i = 0; i < 9; i++) {
            const step = i - 4;
            hueOffsets[i] = step * 20; // 160 degree sweep
        }
    } else if (mode === 'monochrome') {
        for (let i = 0; i < 9; i++) {
            const step = i - 4;
            hueOffsets[i] = step * 2; // Very subtle shift
        }
    } else if (mode === 'analogous') {
        for (let i = 0; i < 9; i++) {
            const step = i - 4;
            hueOffsets[i] = step * 8; // 64 degree sweep
        }
    } else if (mode === 'tetradic') {
        // Targets: -180, -120, -60, -30, 0, 30, 60, 120, 180
        const targets = [-180, -120, -60, -30, 0, 30, 60, 120, 180];
        targets.forEach((val, idx) => hueOffsets[idx] = val);
    } else if (mode === 'quadratic') {
        // Targets: -180, -135, -90, -45, 0, 45, 90, 135, 180
        const targets = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
        targets.forEach((val, idx) => hueOffsets[idx] = val);
    }

    // --- Step B: Generate the Main "Spine" (Row 3 - Base Spine) ---
    const spine = [];
    for (let i = 0; i < 9; i++) {
        const step = i - 4;

        let h = (rootLch.h + hueOffsets[i] + 360) % 360;
        let c = rootLch.c;
        let l = rootLch.l;

        // Apply Lightness/Chroma curves
        if (step < 0) {
            const mag = Math.abs(step);
            l = clamp(l + mag * 6, 0, 100);
            c = clamp(c - mag * 5, 0, 100);
        } else if (step > 0) {
            l = clamp(l - step * 6, 0, 100);
            c = clamp(c + step * 5, 0, 100);
        }

        spine.push(colord({ l, c, h }));
    }

    // --- Step C: Generate the 4-Row Matrix ---
    const rawMatrix = [[], [], [], []];

    spine.forEach((base) => {
        const lch = base.toLch();

        // Row 1: Highlights (Lightness +25, Chroma -15, Hue shift)
        rawMatrix[0].push(colord({
            l: clamp(lch.l + 25, 0, 100),
            c: clamp(lch.c - 15, 0, 100),
            h: (lch.h - 5 + 360) % 360
        }));

        // Row 2: Muted (Lightness +5, Chroma -25)
        rawMatrix[1].push(colord({
            l: clamp(lch.l + 5, 0, 100),
            c: clamp(lch.c - 25, 0, 100),
            h: lch.h
        }));

        // Row 3: Base Spine
        rawMatrix[2].push(base);

        // Row 4: Deep Shadows (Lightness -25, Chroma +10)
        rawMatrix[3].push(colord({
            l: clamp(lch.l - 25, 0, 100),
            c: clamp(lch.c + 10, 0, 100),
            h: (lch.h + 5) % 360
        }));
    });

    // --- Step D: Format for UI ---
    const matrix = rawMatrix.map(row =>
        row.map(c => ({
            hex: c.toHex().toUpperCase(),
            name: getColorName(c.toHex()),
            isDark: c.isDark()
        }))
    );

    // Pick featured colors for the Mother/Bento Grid
    const featured = [
        matrix[2][4], // Mother Color (Center of Spine)
        matrix[0][2], // Highlight Square
        matrix[1][3], // Muted Square (Mid-Left)
        matrix[3][6], // Deep Rectangle (Spanning)
        matrix[0][7], // Special Detail Square
    ];

    return { featured, matrix, mode };
}

export function getColorName(hex) {
    const color = colord(hex);
    const name = color.toName({ closest: true }) || "Unknown";
    const adjectives = ["Vibrant", "Soft", "Deep", "Pure", "Misty", "Royal", "Rich", "Clear"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    return `${randomAdj} ${name.charAt(0).toUpperCase() + name.slice(1)}`;
}
