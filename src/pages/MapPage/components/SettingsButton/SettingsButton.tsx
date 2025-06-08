"use client"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useDispatch } from "react-redux"
import { toggleSettingsModal } from "@/redux/settingsActions"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TooltipProvider } from "@/components/ui/tooltip"

function SettingsButton() {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(toggleSettingsModal(true))
  }

  return (
    <div className="absolute top-4 right-4 z-[100]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClick}
              className="h-10 w-10 bg-white shadow-md hover:shadow-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default SettingsButton
