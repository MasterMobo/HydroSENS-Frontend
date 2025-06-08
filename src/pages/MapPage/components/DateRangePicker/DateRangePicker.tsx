import * as React from "react";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react"; // Import AlertCircle
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
    const [error, setError] = React.useState<string | null>(null);

    // Get dates and region index from Redux state
    const { startDate, endDate } = useSelector(
        (state: RootState) => state.dateState
    );
    const { selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );

    // Convert Redux dates to DateRange format, memoized for performance
    const dateRange: DateRange | undefined = React.useMemo(() => {
        const from = startDate ? new Date(startDate) : undefined;
        const to = endDate ? new Date(endDate) : undefined;
        if (from || to) {
            return { from, to };
        }
        return undefined;
    }, [startDate, endDate]);

    // Handle date changes from the calendar component
    const handleDateRangeChange = (range: DateRange | undefined) => {
        // Clear any previous errors when a new selection is made
        setError(null);

        // When a user selects the second date
        if (range?.from && range?.to) {
            // Check if the range is greater than 5 days
            if (differenceInDays(range.to, range.from) > 5) {
                dispatch(setStartDate(range.from.getTime()));
                dispatch(setEndDate(range.to.getTime()));
            } else {
                // If not, set an error message
                setError("The selected date range must be longer than 5 days.");
                // Set only the start date and clear the end date
                dispatch(setStartDate(range.from.getTime()));
                dispatch(setEndDate(0));
                // Clear the error message after 3 seconds
                setTimeout(() => setError(null), 3000);
            }
        } else {
            // When a user is selecting the first date
            dispatch(setStartDate(range?.from?.getTime() || 0));
            dispatch(setEndDate(0));
        }
    };

    return (
        <div
            className={"absolute bottom-0 mb-3"}
            style={{
                left:
                    selectedRegionIndex === null
                        ? "calc(50% - 150px)"
                        : "calc(25% - 150px)",
            }}
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className="font-normal py-6.5 rounded-3xl w-[300px] justify-start text-left"
                    >
                        <div className="bg-primary p-2 rounded-sm mr-2">
                            <CalendarIcon className="h-4 w-4" color="white" />
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
                    {/* Nicely Formatted Error Message */}
                    {error && (
                        <div className="p-3 text-center text-sm text-red-600 bg-red-50 flex items-center justify-center rounded-t-md">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from || new Date()}
                        selected={dateRange}
                        onSelect={handleDateRangeChange}
                        numberOfMonths={2}
                        disabled={{ after: new Date() }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default DateRangePicker;