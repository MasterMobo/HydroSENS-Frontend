export const calculatePolygonArea = (coordinates: [number, number][]) => {
    if (coordinates.length < 3) return 0;

    let area = 0;
    const n = coordinates.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coordinates[i][0] * coordinates[j][1];
        area -= coordinates[j][0] * coordinates[i][1];
    }

    area = Math.abs(area) / 2;
    area = area * 12391; // Rough conversion to km²

    return Math.round(area * 100) / 100;
};
