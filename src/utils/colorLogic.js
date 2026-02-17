import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import a11yPlugin from "colord/plugins/a11y";

extend([namesPlugin, a11yPlugin]);

/**
 * Generates a professional 36-Color Matrix (9x4 Grid).
 * @param {string} rootHex - The mother color hex string.
 * @returns {Object} - Object { featured: Array(5), matrix: Array(4) }
 */
export function generatePalette(rootHex) {
    const root = colord(rootHex);
    const rootHsl = root.toHsl();

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    // --- Step A: Generate the "Spine" (Row 3 - The Anchor) ---
    const spine = [];
    for (let i = -4; i <= 4; i++) {
        let h = rootHsl.h;
        let s = rootHsl.s;
        let l = rootHsl.l;

        if (i < 0) {
            const steps = Math.abs(i);
            l = clamp(l + steps * 5, 0, 100);
            s = clamp(s - steps * 5, 0, 100);
            h = (h - steps * 22 + 360) % 360;
        } else if (i > 0) {
            l = clamp(l - i * 5, 0, 100);
            s = clamp(s + i * 5, 0, 100);
            h = (h + i * 22) % 360;
        }
        spine.push(colord({ h, s, l }));
    }

    // --- Step B: Generate the Matrix ---
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

    // --- Step C: Format and Naming ---
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

    return { featured, matrix };
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
