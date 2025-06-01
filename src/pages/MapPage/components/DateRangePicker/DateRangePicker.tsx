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

    // Get dates from Redux state
    const { startDate, endDate } = useSelector(
        (state: RootState) => state.dateState
    );
    const { selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );

    // Convert Redux dates to DateRange format for the ShadCN component
    const dateRange: DateRange | undefined = React.useMemo(() => {
        if (!startDate && !endDate) return undefined;

        return {
            from: new Date(startDate) || undefined,
            to: new Date(endDate) || undefined,
        };
    }, [startDate, endDate]);

    // Handle date changes from the calendar component
    const handleDateRangeChange = (range: DateRange | undefined) => {
        if (range?.from) {
            dispatch(setStartDate(range.from.getTime()));
        }

        if (range?.to) {
            dispatch(setEndDate(range.to.getTime()));
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
                        defaultMonth={new Date(endDate)}
                        selected={dateRange}
                        onSelect={handleDateRangeChange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default DateRangePicker;
