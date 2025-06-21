"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import {
  setSelectedMetrics,
  setEndmemberType,
  toggleSettingsModal,
  AVAILABLE_METRICS,
  ENDMEMBER_TYPES,
  type MetricKey,
  type EndmemberType,
} from "@/redux/settingsActions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

function SettingsModal() {
  const dispatch = useDispatch()
  const { selectedMetrics, endmemberType, isSettingsModalOpen } = useSelector((state: RootState) => state.settings)

  // Local state for temporary changes before applying
  const [tempSelectedMetrics, setTempSelectedMetrics] = useState<MetricKey[]>(selectedMetrics)
  const [tempEndmemberType, setTempEndmemberType] = useState<EndmemberType>(endmemberType)

  // Update local state when modal opens
  useEffect(() => {
    if (isSettingsModalOpen) {
      setTempSelectedMetrics(selectedMetrics)
      setTempEndmemberType(endmemberType)
    }
  }, [isSettingsModalOpen, selectedMetrics, endmemberType])

  const handleClose = () => {
    dispatch(toggleSettingsModal(false))
  }

  const handleCancel = () => {
    // Reset temporary state to current saved state
    setTempSelectedMetrics(selectedMetrics)
    setTempEndmemberType(endmemberType)
    handleClose()
  }

  const handleApply = () => {
    // Apply temporary changes to Redux state
    dispatch(setSelectedMetrics(tempSelectedMetrics))
    dispatch(setEndmemberType(tempEndmemberType))

    // Console log the selected metrics
    console.log("Applied Settings:")
    console.log("Selected Metrics:", tempSelectedMetrics)
    console.log("Endmember Type:", tempEndmemberType)

    handleClose()
  }

  const handleMetricToggle = (metricKey: MetricKey, checked: boolean) => {
    if (checked) {
      setTempSelectedMetrics([...tempSelectedMetrics, metricKey])
    } else {
      setTempSelectedMetrics(tempSelectedMetrics.filter((key) => key !== metricKey))
    }
  }

  const handleEndmemberChange = (value: EndmemberType) => {
    setTempEndmemberType(value)
  }

  if (!isSettingsModalOpen) return null

  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden relative z-[1001]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Settings</h2>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Output Statistics Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Output Statistics</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="z-[9999]">
                    <p>Select which metrics to include in the analysis</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-3">
                {AVAILABLE_METRICS.map((metric) => (
                  <div key={metric.key} className="flex items-center space-x-3">
                    <Checkbox
                      id={metric.key}
                      checked={tempSelectedMetrics.includes(metric.key)}
                      onCheckedChange={(checked) => handleMetricToggle(metric.key, checked as boolean)}
                    />
                    <label
                      htmlFor={metric.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {metric.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimized For Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Optimized For</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="z-[9999]">
                    <p>Choose the endmember type for analysis optimization</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Custom Select Implementation */}
              <div className="relative">
                <select
                  value={tempEndmemberType}
                  onChange={(e) => handleEndmemberChange(e.target.value as EndmemberType)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                >
                  {ENDMEMBER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="h-4 w-4 opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1" disabled={tempSelectedMetrics.length === 0}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default SettingsModal
