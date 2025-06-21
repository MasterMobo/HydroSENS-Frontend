import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setEndDate, setStartDate } from "@/redux/dateActions";
import Calendar from "./Calendar";

export function DateRangePicker() {
    const dispatch = useDispatch();

    // Track which date we're currently selecting (start or end)
    const [selectingStart, setSelectingStart] = React.useState(true);

    // Get dates from Redux state
    const { startDate, endDate } = useSelector(
        (state: RootState) => state.dateState
    );
    const { selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );

    // Calculate the maximum allowed date (5 days before today)
    const maxAllowedDate = React.useMemo(() => {
        const today = new Date();
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(today.getDate() - 5);
        return fiveDaysAgo;
    }, []);

    // Convert Redux dates to DateRange format for the ShadCN component
    const dateRange: DateRange | undefined = React.useMemo(() => {
        if (!startDate && !endDate) return undefined;

        return {
            from: startDate ? new Date(startDate) : undefined,
            to: endDate ? new Date(endDate) : undefined,
        };
    }, [startDate, endDate]);

    // Handle single date clicks for sequential selection
    const handleDateClick = (date: Date) => {
        if (selectingStart) {
            // First click or odd clicks - set start date and default end date to same date
            dispatch(setStartDate(date.getTime()));
            dispatch(setEndDate(date.getTime())); // Default end date to same as start date
            setSelectingStart(false);
        } else {
            // Second click or even clicks - set end date
            dispatch(setEndDate(date.getTime()));
            setSelectingStart(true);
        }
    };

    // Handle range selection - we'll intercept and use our custom logic
    const handleRangeSelect = (range: DateRange | undefined) => {
        // We don't use the default range selection, instead we handle clicks manually
        // This function will be called but we'll ignore it in favor of our custom logic
    };

    return (
        <div className={"flex justify-center items-center w-full"}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className="font-normal py-6.5 rounded-3xl"
                    >
                        <div className="bg-primary p-2 rounded-sm mr-0.5">
                            <CalendarIcon className=" h-4 w-4" color="white" />
                        </div>
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        autoFocus
                        mode="range"
                        defaultMonth={maxAllowedDate}
                        selected={dateRange}
                        onSelect={handleRangeSelect}
                        onDayClick={(date) => {
                            // Only handle clicks on enabled dates
                            if (date <= maxAllowedDate) {
                                handleDateClick(date);
                            }
                        }}
                        numberOfMonths={2}
                        toDate={maxAllowedDate}
                        disabled={(date) => date > maxAllowedDate}
                    />
                    <div className="p-3 text-sm text-muted-foreground border-t">
                        {selectingStart
                            ? "Select start date"
                            : "Select end date"}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default DateRangePicker;
