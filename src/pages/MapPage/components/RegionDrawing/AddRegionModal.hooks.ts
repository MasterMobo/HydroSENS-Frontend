import { MAX_REGION_AREA_KMSQ } from "@/constants";
import { useMemo } from "react";

export const useRegionSizeLimit = (currentArea: number) => {
    const areaSizePercent = useMemo(
        () => `${(currentArea / MAX_REGION_AREA_KMSQ) * 100}%`,
        [currentArea]
    );

    const areaSizeText = useMemo(
        () => `${Math.floor(currentArea)}/${MAX_REGION_AREA_KMSQ} km²`,
        [currentArea]
    );

    const isOverAreaSizeLimit = useMemo(
        () => currentArea > MAX_REGION_AREA_KMSQ,
        [currentArea]
    );

    return { areaSizePercent, areaSizeText, isOverAreaSizeLimit };
};
