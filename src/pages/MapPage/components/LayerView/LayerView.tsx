// components/LayerView/LayerView.tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setSelectedDate, setSelectedLayer } from "@/redux/layerActions";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Layers, Calendar, Image } from "lucide-react";

const LayerView: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const layerState = useSelector((state: RootState) => state.layers);
    const dashboardState = useSelector((state: RootState) => state.dashboard);

    const { dateLayers, selectedDate, selectedLayer, loading, error } =
        layerState;

    // Get available layers for the selected date
    const selectedDateLayers =
        dateLayers.find((dl) => dl.date === selectedDate)?.layers || [];

    // Add a "No Layer" option at the beginning
    const layersWithNoOption = [
        { name: "none", displayName: "No Layer" },
        ...selectedDateLayers.map((layer) => ({
            name: layer.name,
            displayName: layer.name.replace(".tif", ""),
        })),
    ];

    const handleDateChange = (date: string) => {
        dispatch(setSelectedDate(date));
        // Auto-select "No Layer" option for the new date
        dispatch(setSelectedLayer("none"));
    };

    const handleLayerChange = (layerName: string) => {
        dispatch(setSelectedLayer(layerName));
    };

    // Show loading if either dashboard is loading or layers are loading
    if (loading || dashboardState.loading) {
        return (
            <Card className="w-40 mr-4 bg-white/95 backdrop-blur-sm shadow-lg py-4">
                <CardContent className="px-4 py-0">
                    <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading layers</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-40 mr-4 bg-white/95 backdrop-blur-sm shadow-lg py-4">
                <CardContent className="px-4 py-0">
                    <div className="text-sm text-red-600">
                        Error loading layers: {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Only show "No layer data available" if dashboard has finished loading and there's no error
    if (
        dateLayers.length === 0 &&
        !dashboardState.loading &&
        !dashboardState.error
    ) {
        return (
            <Card className="w-40 mr-4 bg-white/95 backdrop-blur-sm shadow-lg py-4">
                <CardContent className="px-4 py-0">
                    <div className="text-sm text-gray-600">
                        No layer data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-40 mr-4 bg-white/95 backdrop-blur-sm shadow-lg py-4">
            <CardContent className="px-4 py-0">
                <Accordion type="single" collapsible>
                    <AccordionItem value="layers" className="border-none">
                        <AccordionTrigger className="py-0 hover:no-underline">
                            <div className="flex items-center space-x-2">
                                <Layers className="w-4 h-4" />
                                <span className="font-medium text-sm">
                                    Layers
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
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

                            {/* Layer Selection - Dropdown */}
                            {selectedDate && layersWithNoOption.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700 flex items-center space-x-1">
                                        <Image className="w-3 h-3" />
                                        <span>Layer</span>
                                    </label>
                                    <Select
                                        value={selectedLayer || "none"}
                                        onValueChange={handleLayerChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select layer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {layersWithNoOption.map((layer) => (
                                                <SelectItem
                                                    key={layer.name}
                                                    value={layer.name}
                                                >
                                                    {layer.displayName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default LayerView;
