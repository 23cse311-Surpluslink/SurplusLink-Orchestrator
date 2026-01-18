import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Clock, Package, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { VerificationBanner } from '@/components/layout/verification-banner';
import { cn } from '@/lib/utils';

const foodTypes = [
  'Prepared Meals',
  'Bakery Items',
  'Fresh Produce',
  'Dairy Products',
  'Packaged Food',
  'Beverages',
  'Event Leftovers',
  'Other'
];

const pickupWindows = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
  '5:00 PM - 7:00 PM',
  '7:00 PM - 9:00 PM'
];

export default function PostDonation() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isVerified = user?.status === 'active';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Your account must be approved by an administrator before you can post donations.",
      });
      return;
    }

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Donation Posted!",
      description: "NGOs in your area will be notified immediately.",
    });

    navigate('/donor/donations');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <VerificationBanner />
      <PageHeader
        title="Post a Donation"
        description="Share your surplus food with NGOs in your area."
      />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-primary" />
                Food Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="foodType" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Food Type</Label>
                  <Select required disabled={!isVerified}>
                    <SelectTrigger id="foodType" className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodTypes.map(type => (
                        <SelectItem key={type} value={type.toLowerCase().replace(' ', '-')}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</Label>
                  <Input
                    id="quantity"
                    placeholder="e.g., 25 portions"
                    className="h-11"
                    required
                    disabled={!isVerified}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any ingredients, allergens, or special handling instructions..."
                  rows={4}
                  className="resize-none"
                  disabled={!isVerified}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-5 w-5 text-primary" />
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Best Before Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    className="h-11"
                    required
                    disabled={!isVerified}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryTime" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Best Before Time</Label>
                  <Input
                    id="expiryTime"
                    type="time"
                    className="h-11"
                    required
                    disabled={!isVerified}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupWindow" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Pickup Window</Label>
                <Select required disabled={!isVerified}>
                  <SelectTrigger id="pickupWindow" className="h-11">
                    <SelectValue placeholder="Select window" />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupWindows.map(window => (
                      <SelectItem key={window} value={window}>
                        {window}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pickup Address</Label>
                <Input
                  id="address"
                  placeholder="Street address, building, apartment..."
                  defaultValue="123 Main Street, Downtown"
                  className="h-11"
                  required
                  disabled={!isVerified}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pickup Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Gate code, floor number, contact person details..."
                  rows={3}
                  className="resize-none"
                  disabled={!isVerified}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="h-5 w-5 text-primary" />
                Photo (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl p-8 text-center transition-all group",
                isVerified ? "hover:bg-primary/10 hover:border-primary/40 cursor-pointer" : "opacity-50 cursor-not-allowed"
              )}>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-sm">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 h-12 text-base font-semibold"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isVerified ? "hero" : "secondary"}
              size="lg"
              className="flex-2 lg:flex-1 h-12 text-base font-bold shadow-xl shadow-primary/20"
              disabled={isSubmitting || !isVerified}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </div>
              ) : isVerified ? (
                'Post Donation'
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Verification Required
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
