import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCurrentCoordinates, setRegionName, resetDrawingState } from "@/redux/regionDrawingActions";
import { addRegion } from "@/redux/regionActions";
import { setViewMode } from "@/redux/viewModeActions";
import { ViewMode } from "@/types/viewMode";
import { generateRandomColor } from "@/utils/colors";
import { calculatePolygonArea } from "@/utils/map";
// @ts-ignore shpjs has imperfect typings
import shp from "shpjs";

interface ShapefileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShapefileLoaded: () => void;  // called only on multi‐polygon import
}

interface ParsedShapefile {
  features: Array<{
    geometry: { type: string; coordinates: any };
    properties: Record<string, any>;
  }>;
}

export default function ShapefileUploadModal({
  isOpen,
  onClose,
  onShapefileLoaded,
}: ShapefileUploadModalProps) {
  const dispatch = useDispatch();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [hasMultipleShapefiles, setHasMultipleShapefiles] = useState(false);

  const convertGeometryToCoordinates = useCallback(
    (geometry: any): [number, number][] => {
      const flat: [number, number][] = [];
      if (geometry.type === "Polygon") {
        const ring = geometry.coordinates?.[0];
        if (Array.isArray(ring)) ring.forEach((c: number[]) => flat.push([c[1], c[0]]));
      } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates?.forEach((poly: any[]) => {
          const ring = poly?.[0];
          if (Array.isArray(ring)) ring.forEach((c: number[]) => flat.push([c[1], c[0]]));
        });
      } else if (geometry.type === "LineString") {
        geometry.coordinates?.forEach((c: number[]) => flat.push([c[1], c[0]]));
      } else if (geometry.type === "Point") {
        flat.push([geometry.coordinates[1], geometry.coordinates[0]]);
      } else {
        console.warn(`Unsupported geometry type: ${geometry.type}`);
      }
      return flat;
    },
    []
  );

  const checkForMultipleShapefiles = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setHasMultipleShapefiles(false);
      return;
    }

    try {
      // This is a simplified check - in reality, you might want to use a zip library
      // to properly inspect the contents without fully parsing
      const buffer = await file.arrayBuffer();
      const geojson: ParsedShapefile = await shp(buffer);
      
      // Check if we have multiple features that would result in multiple regions
      const polygonCount = geojson.features?.filter(feat => 
        feat.geometry.type === "Polygon" || feat.geometry.type === "MultiPolygon"
      ).length || 0;
      
      // Also count MultiPolygon rings
      let totalShapes = 0;
      geojson.features?.forEach((feat) => {
        if (feat.geometry.type === "Polygon") {
          totalShapes++;
        } else if (feat.geometry.type === "MultiPolygon") {
          totalShapes += feat.geometry.coordinates?.length || 0;
        }
      });

      setHasMultipleShapefiles(totalShapes > 1);
    } catch (err) {
      // If we can't parse it, assume it's not multiple shapefiles
      setHasMultipleShapefiles(false);
    }
  }, []);

  const processShapefile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const buffer = await file.arrayBuffer();
        const baseName = file.name.replace(/\.(zip|shp)$/i, "").replace(/[_-]/g, " ");
        const lower = file.name.toLowerCase();
        const geojson: ParsedShapefile =
          lower.endsWith(".zip") || lower.endsWith(".shp")
            ? await shp(buffer)
            : (() => { throw new Error("Unsupported format. Upload .zip or .shp."); })();

        if (!geojson.features?.length) {
          throw new Error("No features found in shapefile.");
        }

        // collect every polygon ring as one flat shape
        const shapes: [number, number][][] = [];
        geojson.features.forEach((feat) => {
          const geom = feat.geometry;
          if (geom.type === "Polygon") {
            shapes.push(convertGeometryToCoordinates(geom));
          } else if (geom.type === "MultiPolygon") {
            geom.coordinates.forEach((poly: any[]) => {
              shapes.push(
                convertGeometryToCoordinates({ type: "Polygon", coordinates: poly })
              );
            });
          }
        });

        // --- MULTI-POLYGON IMPORT ---
        if (shapes.length > 1) {
          shapes.forEach((coords, i) => {
            dispatch(
              addRegion({
                name: `${baseName} #${i + 1}`,
                coordinates: coords,
                color: generateRandomColor(),
                area: calculatePolygonArea(coords),
              })
            );
          });
          
          // Reset drawing state and return to main view
          dispatch(resetDrawingState());
          dispatch(setViewMode(ViewMode.MAIN_VIEW));
          onShapefileLoaded();  // signal AddRegionModal to close
          onClose();            // close this modal
          return;
        }

        // --- SINGLE-POLYGON IMPORT ---
        const coords = shapes[0];
        if (!coords?.length) throw new Error("Failed to extract coordinates.");
        dispatch(setCurrentCoordinates(coords));
        dispatch(setRegionName(baseName));
        onClose();            // just close this modal
      } catch (err: any) {
        setError(err.message || "Failed to process shapefile.");
      } finally {
        setIsLoading(false);
      }
    },
    [convertGeometryToCoordinates, dispatch, onClose, onShapefileLoaded]
  );

  const handleFileSelect = useCallback(async (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".zip", ".shp"].includes(ext)) {
      setError("Please select a .zip or .shp file.");
      return;
    }
    setUploadedFile(file);
    setError(null);
    
    // Check for multiple shapefiles
    await checkForMultipleShapefiles(file);
  }, [checkForMultipleShapefiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = Array.from(e.dataTransfer.files)[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);
  const handleUpload = useCallback(() => uploadedFile && processShapefile(uploadedFile), [uploadedFile, processShapefile]);
  const handleCloseModal = useCallback(() => {
    setUploadedFile(null);
    setError(null);
    setIsDragOver(false);
    setHasMultipleShapefiles(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-700/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Upload Shapefile</h3>
          <Button variant="ghost" size="sm" onClick={handleCloseModal} disabled={isLoading}>
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-sm text-gray-600 mb-2">Drag & drop your shapefile here, or click to browse</p>
            <p className="text-xs text-gray-500 mb-4">Supports .zip archives or individual .shp files</p>
            <Input
              id="shp-input"
              type="file"
              accept=".zip,.shp"
              onChange={handleInputChange}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("shp-input")?.click()}
              disabled={isLoading}
            >
              Choose File
            </Button>
          </div>

          {uploadedFile && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText size={20} className="text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          {hasMultipleShapefiles && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <AlertCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <p className="font-medium mb-1">Detected multiple polygons in the shapefile.</p>
                <p>You won't be able to edit the regions after importing.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Shapefile Requirements:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• .zip archive containing all shapefile components</li>
              <li>• Required: .shp, .shx, .dbf (± .prj)</li>
              <li>• Polygon, MultiPolygon, LineString or Point</li>
              <li>• Multiple features → split into separate regions</li>
              <li>• Coordinates converted to lat/lng format</li>
              <li>• {hasMultipleShapefiles ? "Note: Multiple regions cannot be edited after import" : "Single regions can be edited after import"}</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpload} 
              disabled={!uploadedFile || isLoading} 
              className="flex-1"
            >
              {isLoading ? "Processing..." : "Upload & Import"}
            </Button>
            <Button variant="outline" onClick={handleCloseModal} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}