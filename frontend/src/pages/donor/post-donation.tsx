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
import { Upload, MapPin, Clock, Package } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="space-y-6 max-w-3xl">
      <PageHeader 
        title="Post a Donation"
        description="Share your surplus food with NGOs in your area."
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Food Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foodType">Food Type</Label>
                <Select required>
                  <SelectTrigger id="foodType">
                    <SelectValue placeholder="Select food type" />
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
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  placeholder="e.g., 25 portions, 10 kg" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Any additional details about the food (ingredients, allergens, storage requirements)..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Best Before Date</Label>
                <Input 
                  id="expiryDate" 
                  type="date" 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryTime">Best Before Time</Label>
                <Input 
                  id="expiryTime" 
                  type="time" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupWindow">Preferred Pickup Window</Label>
              <Select required>
                <SelectTrigger id="pickupWindow">
                  <SelectValue placeholder="Select pickup window" />
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Pickup Address</Label>
              <Input 
                id="address" 
                placeholder="Enter full address"
                defaultValue="123 Main Street, Downtown"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Pickup Instructions (Optional)</Label>
              <Textarea 
                id="instructions" 
                placeholder="e.g., Use back entrance, ask for kitchen manager..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Photo (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-8">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="hero" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Donation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
