// components/LayerView/LayerView.tsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setSelectedDate, setSelectedLayer } from "@/redux/layerActions";
import { Button } from "@/components/ui/button";
// Note: You'll need to implement these UI components or use your existing ones
// For now, I'll create simple versions
const Select: React.FC<{
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
}> = ({ value, onValueChange, children }) => (
    <div className="relative">{children}</div>
);

const SelectTrigger: React.FC<{
    className?: string;
    children: React.ReactNode;
}> = ({ className, children }) => (
    <div className={`border rounded px-3 py-2 ${className}`}>{children}</div>
);

const SelectValue: React.FC<{
    placeholder?: string;
}> = ({ placeholder }) => <span className="text-gray-500">{placeholder}</span>;

const SelectContent: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => (
    <div className="absolute top-full left-0 right-0 bg-white border rounded shadow-lg z-10">
        {children}
    </div>
);

const SelectItem: React.FC<{
    value: string;
    children: React.ReactNode;
}> = ({ value, children }) => (
    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{children}</div>
);

const Card: React.FC<{
    className?: string;
    children: React.ReactNode;
}> = ({ className, children }) => <div className={className}>{children}</div>;

const CardContent: React.FC<{
    className?: string;
    children: React.ReactNode;
}> = ({ className, children }) => <div className={className}>{children}</div>;
import {
    Layers,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Image,
} from "lucide-react";

const LayerView: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const layerState = useSelector((state: RootState) => state.layers);
    const [isExpanded, setIsExpanded] = useState(false);

    const { dateLayers, selectedDate, selectedLayer, loading, error } =
        layerState;

    // Get available layers for the selected date
    const selectedDateLayers =
        dateLayers.find((dl) => dl.date === selectedDate)?.layers || [];

    // Get current layer index for navigation
    const currentLayerIndex = selectedDateLayers.findIndex(
        (layer) => layer.name === selectedLayer
    );

    const handleDateChange = (date: string) => {
        dispatch(setSelectedDate(date));
        // Auto-select first layer for the new date
        const newDateLayers =
            dateLayers.find((dl) => dl.date === date)?.layers || [];
        if (newDateLayers.length > 0) {
            dispatch(setSelectedLayer(newDateLayers[0].name));
        }
    };

    const handleLayerChange = (layerName: string) => {
        dispatch(setSelectedLayer(layerName));
    };

    const handlePreviousLayer = () => {
        if (currentLayerIndex > 0) {
            dispatch(
                setSelectedLayer(selectedDateLayers[currentLayerIndex - 1].name)
            );
        }
    };

    const handleNextLayer = () => {
        if (currentLayerIndex < selectedDateLayers.length - 1) {
            dispatch(
                setSelectedLayer(selectedDateLayers[currentLayerIndex + 1].name)
            );
        }
    };

    if (loading) {
        return (
            <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading layers...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4">
                    <div className="text-sm text-red-600">
                        Error loading layers: {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (dateLayers.length === 0) {
        return (
            <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4">
                    <div className="text-sm text-gray-600">
                        No layer data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4" />
                        <span className="font-medium text-sm">Layer View</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? "Collapse" : "Expand"}
                    </Button>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Date</span>
                    </label>
                    <Select
                        value={selectedDate || ""}
                        onValueChange={handleDateChange}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                            {dateLayers.map((dateLayer) => (
                                <SelectItem
                                    key={dateLayer.date}
                                    value={dateLayer.date}
                                >
                                    {dateLayer.date}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Layer Selection - Image Slider Style */}
                {selectedDate && selectedDateLayers.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 flex items-center space-x-1">
                            <Image className="w-3 h-3" />
                            <span>
                                Layer ({currentLayerIndex + 1} of{" "}
                                {selectedDateLayers.length})
                            </span>
                        </label>

                        {/* Image Slider */}
                        <div className="relative">
                            {/* Current Layer Display */}
                            <div className="bg-gray-100 rounded-lg p-4 text-center min-h-[80px] flex items-center justify-center">
                                <div className="space-y-2">
                                    {/* Default image icon */}
                                    <div className="w-12 h-12 mx-auto bg-gray-300 rounded-lg flex items-center justify-center">
                                        <Image className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div className="text-sm font-medium">
                                        {selectedLayer?.replace(".tif", "")}
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Controls */}
                            <div className="flex items-center justify-between mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousLayer}
                                    disabled={currentLayerIndex <= 0}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <span className="text-xs text-gray-600">
                                    {selectedLayer?.replace(".tif", "")}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextLayer}
                                    disabled={
                                        currentLayerIndex >=
                                        selectedDateLayers.length - 1
                                    }
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Expanded View - Dropdown Selection */}
                        {isExpanded && (
                            <div className="space-y-2 border-t pt-2">
                                <Select
                                    value={selectedLayer || ""}
                                    onValueChange={handleLayerChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select layer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedDateLayers.map((layer) => (
                                            <SelectItem
                                                key={layer.name}
                                                value={layer.name}
                                            >
                                                {layer.name.replace(".tif", "")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LayerView;
