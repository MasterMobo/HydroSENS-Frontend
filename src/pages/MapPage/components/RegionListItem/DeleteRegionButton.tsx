import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteRegion } from "@/redux/regionActions";
import { useDispatch } from "react-redux";

interface DeleteRegionButtonProps {
    index: number;
}
function DeleteRegionButton({ index }: DeleteRegionButtonProps) {
    const dispatch = useDispatch();

    const handleDeleteRegionClick = (index: number) => {
        dispatch(deleteRegion(index));
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger className="text-gray-500 hover:text-red-500 ml-2 text-2xl">
                &times;
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this region?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this region?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        className="bg-red-500"
                        onClick={() => handleDeleteRegionClick(index)}
                    >
                        Delete
                    </AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default DeleteRegionButton;
