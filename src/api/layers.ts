import { api } from "./client";

export interface LayerFile {
    name: string; // e.g., "vegetation.tif", "NVDI.tif"
    blob: Blob;
    url: string; // Object URL for the blob
}

export interface DateLayers {
    date: string; // e.g., "2025-05-12"
    layers: LayerFile[];
}

export async function fetchLayerTifs(): Promise<DateLayers[]> {
    try {
        const response = await api.get("/analyze/export-tifs", {
            responseType: "blob",
        });

        // We'll need a library to extract ZIP files in the browser
        // For now, let's assume we have JSZip available
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(response.data);

        const dateLayers: DateLayers[] = [];
        const dateMap = new Map<string, LayerFile[]>();

        // Process each file in the ZIP
        for (const [path, file] of Object.entries(zip.files)) {
            if (file.dir) continue; // Skip directories

            // Extract date and filename from path (e.g., "2025-05-12/vegetation.tif")
            const pathParts = path.split("/");
            if (pathParts.length !== 2) continue;

            const [date, filename] = pathParts;
            if (!filename.endsWith(".tif")) continue;

            // Get the file blob
            const blob = await file.async("blob");
            const url = URL.createObjectURL(blob);

            const layerFile: LayerFile = {
                name: filename,
                blob,
                url,
            };

            if (!dateMap.has(date)) {
                dateMap.set(date, []);
            }
            dateMap.get(date)!.push(layerFile);
        }

        // Convert map to array and sort by date
        for (const [date, layers] of dateMap.entries()) {
            dateLayers.push({ date, layers });
        }

        dateLayers.sort((a, b) => a.date.localeCompare(b.date));

        return dateLayers;
    } catch (error) {
        console.error("Failed to fetch layer TIFs:", error);
        throw error;
    }
}
