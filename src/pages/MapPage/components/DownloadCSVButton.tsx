import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";

function DownloadCSVButton() {
    const [isLoading, setIsLoading] = useState(false);

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

            // Extract filename from response headers or use default
            const contentDisposition = response.headers["content-disposition"];
            let filename = "export.csv";

            if (contentDisposition) {
                const filenameMatch =
                    contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

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
