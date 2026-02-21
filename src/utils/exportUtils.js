import { colord } from 'colord';
/**
 * Export utilities for Palettable
 */

/**
 * Generates a JSON file matching the W3C Design Tokens format.
 * @param {Object} paletteData - The palette data object.
 * @returns {string} - JSON string
 */
export function generateW3CTokens(paletteData) {
    const tokens = {
        "color": {
            "mother": {
                "$value": paletteData.featured[0].hex,
                "$type": "color"
            },
            "palette": {}
        }
    };

    paletteData.matrix.forEach((row, rIdx) => {
        row.forEach((color, cIdx) => {
            const key = `tone-${rIdx}-${cIdx}`;
            tokens.color.palette[key] = {
                "$value": color.hex,
                "$type": "color",
                "description": color.name
            };
        });
    });

    return JSON.stringify(tokens, null, 2);
}

/**
 * Generates a JSON file matching the Procreate .swatches format (Swatch.json).
 * Note: Procreate usually expects this in a ZIP, but many users import Swatch.json directly.
 */
export function generateProcreateSwatches(paletteData) {
    const mother = paletteData.featured[0];
    const swatches = [];

    // Flatten matrix for Procreate (up to 30 swatches per palette usually)
    paletteData.matrix.flat().slice(0, 30).forEach(color => {
        const c = colord(color.hex).toHsl();
        // Procreate uses a specific format, but for a simple JSON swatch:
        swatches.push({
            hue: c.h / 360,
            saturation: c.s / 100,
            brightness: c.l / 100, // Close to HSB
            alpha: 1
        });
    });

    const data = [{
        name: `Palettable: ${mother.name}`,
        swatches: swatches
    }];

    return JSON.stringify(data, null, 2);
}

/**
 * Generates CSS/Sass variables.
 */
export function generateCSSVariables(paletteData) {
    const mother = paletteData.featured[0];
    let output = `/* Palettable: ${mother.name} (${mother.hex}) */\n`;
    output += `:root {\n`;
    output += `  --mother-color: ${mother.hex};\n`;

    paletteData.matrix.forEach((row, rIdx) => {
        row.forEach((color, cIdx) => {
            output += `  --tone-${rIdx}-${cIdx}: ${color.hex}; /* ${color.name} */\n`;
        });
    });

    output += `}\n`;
    return output;
}

/**
 * Generates a plain text hex list (compatible with Photoshop copy-paste).
 */
export function generateHexList(paletteData) {
    return paletteData.matrix.flat().map(c => c.hex).join('\n');
}

/**
 * Downloads a string as a file.
 */
export function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}
