import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle, Calendar, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockFeedbacks = [
    {
        id: '1',
        donorName: 'Main Street Bakery',
        foodItem: 'Assorted Pastries (10kg)',
        rating: 5,
        comment: 'The food was perfectly packed and still very fresh. Our community loved the croissants!',
        date: '2026-01-15',
        category: 'Cooked'
    },
    {
        id: '2',
        donorName: 'Fresh Mart',
        foodItem: 'Mixed Vegetables (25kg)',
        rating: 4,
        comment: 'Great quantity. Some items were close to expiry but manageable for immediate distribution.',
        date: '2026-01-12',
        category: 'Raw'
    },
    {
        id: '3',
        donorName: 'Hotel Sunrise',
        foodItem: 'Prepared Dinner Trays (50 meals)',
        rating: 5,
        comment: 'Incredible quality. Very professional handling by the donor staff.',
        date: '2026-01-10',
        category: 'Cooked'
    }
];

export function NgoFeedbackPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Feedback & History"
                description="Review your past donations and feedback provided to donors."
            />

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Feedback</TabsTrigger>
                    <TabsTrigger value="high">Highly Rated</TabsTrigger>
                    <TabsTrigger value="critical">Needs Improvement</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    {mockFeedbacks.map((f) => (
                        <Card key={f.id} className="hover:shadow-md transition-shadow transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{f.foodItem}</h3>
                                            <Badge variant="secondary">{f.category}</Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <User className="h-4 w-4" />
                                                <span>{f.donorName}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(f.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-slate-50 border text-sm text-slate-700 italic relative">
                                            <MessageCircle className="absolute -top-2 -left-2 h-5 w-5 text-slate-300 fill-slate-300" />
                                            "{f.comment}"
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center md:border-l pl-4 min-w-[120px]">
                                        <div className="flex mb-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-5 w-5 ${star <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-2xl font-black text-slate-900">{f.rating}/5</span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Donation Score</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
