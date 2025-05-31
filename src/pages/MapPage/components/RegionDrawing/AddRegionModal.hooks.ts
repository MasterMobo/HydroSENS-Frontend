import { MAX_REGION_AREA_KMSQ } from "@/constants";
import { useMemo } from "react";

export const useRegionSizeLimit = (currentArea: number) => {
    const areaSizePercent = useMemo(() => {
        const percent = (currentArea / MAX_REGION_AREA_KMSQ) * 100;
        console.log("Area size percent calculation:", {
            currentArea,
            MAX_REGION_AREA_KMSQ,
            percent,
        });
        return `${Math.min(100, percent)}%`;
    }, [currentArea]);

    const areaSizeText = useMemo(() => {
        const flooredArea = Math.floor(currentArea);
        const text = `${flooredArea}/${MAX_REGION_AREA_KMSQ} km²`;
        console.log("Area size text:", { currentArea, flooredArea, text });
        return text;
    }, [currentArea]);

    const isOverAreaSizeLimit = useMemo(() => {
        const isOver = currentArea > MAX_REGION_AREA_KMSQ;
        console.log("Is over area size limit:", {
            currentArea,
            MAX_REGION_AREA_KMSQ,
            isOver,
        });
        return isOver;
    }, [currentArea]);

    return { areaSizePercent, areaSizeText, isOverAreaSizeLimit };
};
