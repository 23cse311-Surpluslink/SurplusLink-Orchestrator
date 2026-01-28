import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (rating: number, comment: string) => void;
    loading?: boolean;
}

export function RatingDialog({ isOpen, onClose, onConfirm, loading }: RatingDialogProps) {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [hoverRating, setHoverRating] = useState<number>(0);

    const handleConfirm = () => {
        if (rating > 0) {
            onConfirm(rating, comment);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Rate Delivery</DialogTitle>
                    <DialogDescription>
                        Please rate the condition of the food and the overall experience.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <Label className="text-base font-medium">Rating</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="focus:outline-none transition-transform hover:scale-110"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    disabled={loading}
                                >
                                    <Star
                                        className={cn(
                                            "w-8 h-8 transition-colors",
                                            (hoverRating || rating) >= star
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground h-5">
                            {hoverRating > 0 ? (
                                hoverRating === 1 ? "Poor" :
                                    hoverRating === 2 ? "Fair" :
                                        hoverRating === 3 ? "Good" :
                                            hoverRating === 4 ? "Very Good" : "Excellent"
                            ) : (
                                rating > 0 ? (
                                    rating === 1 ? "Poor" :
                                        rating === 2 ? "Fair" :
                                            rating === 3 ? "Good" :
                                                rating === 4 ? "Very Good" : "Excellent"
                                ) : ""
                            )}
                        </span>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="comment">Comments</Label>
                        <Textarea
                            id="comment"
                            placeholder="Any feedback on the packaging, quality, or process?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Skip
                    </Button>
                    <Button onClick={handleConfirm} disabled={rating === 0 || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Rating
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
