import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    loading?: boolean;
}

export function RejectionModal({ isOpen, onClose, onConfirm, loading }: RejectionModalProps) {
    const [reason, setReason] = useState<string>("");

    const handleConfirm = () => {
        if (reason) {
            onConfirm(reason);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reject Donation</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting this donation. This helps improve future matches.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select onValueChange={setReason} value={reason}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Food Safety Risk">Food Safety Risk (Spoiled/Smell)</SelectItem>
                            <SelectItem value="Improper Packaging">Improper Packaging</SelectItem>
                            <SelectItem value="Transport Issue">Transport Issue</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!reason || loading} variant="destructive">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reject
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
