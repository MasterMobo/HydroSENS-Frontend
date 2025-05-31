import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCurrentCoordinates } from "@/redux/regionDrawingActions";

// @ts-ignore - shpjs doesn't have perfect TypeScript definitions
import shp from "shpjs";

interface ShapefileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShapefileLoaded: () => void;
}

interface ParsedShapefile {
    type: string;
    features: Array<{
        type: string;
        geometry: {
            type: string;
            coordinates: number[][][] | number[][]; // Different formats for different geometry types
        };
        properties: Record<string, any>;
    }>;
}

function ShapefileUploadModal({
    isOpen,
    onClose,
    onShapefileLoaded,
}: ShapefileUploadModalProps) {
    const dispatch = useDispatch();
    const [isDragOver, setIsDragOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const convertGeometryToCoordinates = useCallback(
        (geometry: any): [number, number][] => {
            const coords: [number, number][] = [];

            switch (geometry.type) {
                case "Polygon":
                    // Take the first polygon ring (exterior ring)
                    if (geometry.coordinates && geometry.coordinates[0]) {
                        coords.push(
                            ...geometry.coordinates[0].map(
                                (coord: number[]) => [
                                    coord[1], // lat
                                    coord[0], // lng
                                ]
                            )
                        );
                    }
                    break;
                case "MultiPolygon":
                    // Take the first polygon of the multipolygon
                    if (
                        geometry.coordinates &&
                        geometry.coordinates[0] &&
                        geometry.coordinates[0][0]
                    ) {
                        coords.push(
                            ...geometry.coordinates[0][0].map(
                                (coord: number[]) => [
                                    coord[1], // lat
                                    coord[0], // lng
                                ]
                            )
                        );
                    }
                    break;
                case "LineString":
                    coords.push(
                        ...geometry.coordinates.map((coord: number[]) => [
                            coord[1], // lat
                            coord[0], // lng
                        ])
                    );
                    break;
                case "Point":
                    coords.push([
                        geometry.coordinates[1],
                        geometry.coordinates[0],
                    ]);
                    break;
                default:
                    console.warn(`Unsupported geometry type: ${geometry.type}`);
            }

            return coords;
        },
        []
    );

    const processShapefile = useCallback(
        async (file: File) => {
            setIsLoading(true);
            setError(null);

            try {
                // Convert file to ArrayBuffer
                const arrayBuffer = await file.arrayBuffer();

                let geojson: ParsedShapefile;

                // Check if it's a zip file or individual shapefile
                const fileName = file.name.toLowerCase();

                if (fileName.endsWith(".zip")) {
                    // Parse zip file containing shapefile components
                    geojson = await shp(arrayBuffer);
                } else if (fileName.endsWith(".shp")) {
                    // For individual .shp files, we need to handle them differently
                    // shpjs expects a zip or a URL, so we'll try to parse it directly
                    try {
                        geojson = await shp(arrayBuffer);
                    } catch (zipError) {
                        // If direct parsing fails, provide a helpful error message
                        throw new Error(
                            "Individual .shp files require associated files (.shx, .dbf, .prj). " +
                                "Please upload a .zip archive containing all shapefile components, " +
                                "or try uploading the complete shapefile set."
                        );
                    }
                } else {
                    throw new Error(
                        "Unsupported file format. Please upload a .shp file or .zip archive."
                    );
                }

                if (
                    !geojson ||
                    !geojson.features ||
                    geojson.features.length === 0
                ) {
                    throw new Error(
                        "No features found in shapefile. The file may be empty or corrupted."
                    );
                }

                // Take the first feature and convert its geometry to coordinates
                const firstFeature = geojson.features[0];

                if (!firstFeature.geometry) {
                    throw new Error(
                        "No geometry found in the first feature of the shapefile."
                    );
                }

                const coordinates = convertGeometryToCoordinates(
                    firstFeature.geometry
                );

                if (coordinates.length === 0) {
                    throw new Error(
                        `Could not extract coordinates from geometry type: ${firstFeature.geometry.type}. ` +
                            "Supported types are: Polygon, MultiPolygon, LineString, and Point."
                    );
                }

                // Validate that we have meaningful coordinates
                if (
                    coordinates.length < 3 &&
                    firstFeature.geometry.type !== "Point"
                ) {
                    throw new Error(
                        "Insufficient coordinate points for creating a region."
                    );
                }

                // Dispatch the coordinates to Redux
                dispatch(setCurrentCoordinates(coordinates));

                // Notify parent that shapefile was loaded
                onShapefileLoaded();

                // Close the modal
                onClose();
            } catch (err) {
                console.error("Error processing shapefile:", err);

                let errorMessage = "Failed to process shapefile.";

                if (err instanceof Error) {
                    if (err.message.includes("but-unzip")) {
                        errorMessage =
                            "Unable to process individual .shp file. Please upload a .zip archive " +
                            "containing all shapefile components (.shp, .shx, .dbf, .prj files).";
                    } else {
                        errorMessage = err.message;
                    }
                }

                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [convertGeometryToCoordinates, dispatch, onShapefileLoaded, onClose]
    );

    const handleFileSelect = useCallback((file: File) => {
        // Validate file type
        const validExtensions = [".shp", ".zip"];
        const fileExtension = file.name
            .toLowerCase()
            .substring(file.name.lastIndexOf("."));

        if (!validExtensions.includes(fileExtension)) {
            setError(
                "Please select a .shp file or .zip archive containing shapefile components"
            );
            return;
        }

        setUploadedFile(file);
        setError(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        },
        [handleFileSelect]
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleFileSelect(files[0]);
            }
        },
        [handleFileSelect]
    );

    const handleUpload = useCallback(() => {
        if (uploadedFile) {
            processShapefile(uploadedFile);
        }
    }, [uploadedFile, processShapefile]);

    const handleClose = useCallback(() => {
        setUploadedFile(null);
        setError(null);
        setIsDragOver(false);
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Upload Shapefile</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </Button>
                </div>

                <div className="space-y-4">
                    {/* File Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            isDragOver
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <Upload
                            className="mx-auto mb-4 text-gray-400"
                            size={48}
                        />
                        <p className="text-sm text-gray-600 mb-2">
                            Drag and drop your shapefile here, or click to
                            browse
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                            Supports .zip archives containing shapefile
                            components (.shp, .shx, .dbf, .prj)
                        </p>
                        <Input
                            type="file"
                            accept=".zip"
                            onChange={handleFileInputChange}
                            className="hidden"
                            id="shapefile-input"
                            disabled={isLoading}
                        />
                        <Button
                            variant="outline"
                            onClick={() =>
                                document
                                    .getElementById("shapefile-input")
                                    ?.click()
                            }
                            disabled={isLoading}
                        >
                            Choose File
                        </Button>
                    </div>

                    {/* Selected File Info */}
                    {uploadedFile && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <FileText size={20} className="text-blue-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">
                                    {uploadedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(
                                        2
                                    )}{" "}
                                    MB
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700">
                            <AlertCircle size={20} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Info Section */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                            Shapefile Requirements:
                        </h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>
                                • Upload .zip archive containing all shapefile
                                components
                            </li>
                            <li>
                                • Required files: .shp, .shx, .dbf (and
                                optionally .prj)
                            </li>
                            <li>
                                • Polygon, MultiPolygon, LineString, or Point
                                geometries supported
                            </li>
                            <li>
                                • First feature will be used if multiple
                                features exist
                            </li>
                            <li>
                                • Coordinates will be converted to lat/lng
                                format
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleUpload}
                            disabled={!uploadedFile || isLoading}
                            className="flex-1"
                        >
                            {isLoading ? "Processing..." : "Upload & Import"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShapefileUploadModal;
