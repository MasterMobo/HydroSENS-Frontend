import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { format } from "date-fns";

function DownloadCSVButton() {
    const [isLoading, setIsLoading] = useState(false);

    // Get data from Redux store
    const { regions, selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );
    const { startDate, endDate } = useSelector(
        (state: RootState) => state.dateState
    );

    // Generate filename based on selected region and date range
    const generateFilename = () => {
        const selectedRegion =
            selectedRegionIndex !== null ? regions[selectedRegionIndex] : null;
        const regionName = selectedRegion?.name || "Export";

        // Format dates as DD-MM-YYYY
        const formattedStartDate = format(new Date(startDate), "dd-MM-yyyy");
        const formattedEndDate = format(new Date(endDate), "dd-MM-yyyy");

        // Clean region name (remove special characters that might cause issues in filenames)
        const cleanRegionName = regionName.replace(/[^a-zA-Z0-9]/g, "_");

        return `${cleanRegionName}_${formattedStartDate}_${formattedEndDate}.csv`;
    };

    const handleDownload = async () => {
        try {
            setIsLoading(true);

            const response = await axios.get(
                "http://localhost:5050/analyze/export-csv",
                {
                    responseType: "blob", // Important for file downloads
                    headers: {
                        Accept: "text/csv",
                    },
                }
            );

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            // Use generated filename based on region and dates
            const filename = generateFilename();

            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading CSV:", error);
            // You might want to show a toast notification or error message here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            className="flex-1 h-12 gap-2"
            onClick={handleDownload}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4" />
            )}
            {isLoading ? "Downloading..." : "Download Data"}
        </Button>
    );
}

export default DownloadCSVButton;
