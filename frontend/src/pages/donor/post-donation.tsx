import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Clock, Package, Lock, AlertTriangle, X, Check, ThermometerSnowflake } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { VerificationBanner } from '@/components/layout/verification-banner';
import { cn } from '@/lib/utils';
import DonationService from '@/services/donation.service';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const foodTypes = [
  'Prepared Meals',
  'Bakery Items',
  'Fresh Produce',
  'Dairy Products',
  'Packaged Food',
  'Beverages',
  'Event Leftovers'
];

const allergensList = ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Eggs'];
const dietaryTagsList = ['Veg', 'Non-Veg', 'Vegan', 'Halal', 'Kosher'];

const donationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(1, 'Description is required'),
  foodType: z.string().min(1, 'Please select a food type'),
  foodCategory: z.enum(['cooked', 'raw', 'packaged'], { required_error: 'Please select a category' }),
  storageReq: z.enum(['dry', 'cold', 'frozen'], { required_error: 'Please select storage requirement' }),
  quantity: z.string().min(1, 'Quantity is required'),
  perishability: z.enum(['high', 'medium', 'low'], {
    required_error: 'Please select perishability level',
  }),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  expiryTime: z.string().min(1, 'Expiry time is required'),
  pickupWindowStart: z.string().min(1, 'Pickup start time is required'),
  pickupWindowEnd: z.string().min(1, 'Pickup end time is required'),
  pickupAddress: z.string().min(5, 'Pickup address is required'),
});

type DonationFormValues = z.infer<typeof donationSchema>;

export default function PostDonation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [expiryWarning, setExpiryWarning] = useState(false);
  const [pickupWarning, setPickupWarning] = useState(false);
  const [customAllergen, setCustomAllergen] = useState('');

  const isVerified = user?.status === 'active';

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      title: '',
      description: '',
      foodType: '',
      foodCategory: undefined,
      storageReq: undefined,
      quantity: '',
      perishability: 'medium',
      expiryDate: '',
      expiryTime: '',
      pickupWindowStart: '',
      pickupWindowEnd: '',
      pickupAddress: '',
    },
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not get your current location. Please ensure location permissions are granted.",
          });
        }
      );
    }
  }, [toast]);

  const watchExpiryDate = form.watch('expiryDate');
  const watchExpiryTime = form.watch('expiryTime');
  const watchPickupEnd = form.watch('pickupWindowEnd');

  useEffect(() => {
    if (watchExpiryDate && watchExpiryTime) {
      try {
        const expiry = new Date(`${watchExpiryDate}T${watchExpiryTime}`);
        const now = new Date();
        const diffInHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
        setExpiryWarning(diffInHours > 0 && diffInHours < 2);

        if (watchPickupEnd) {
          const pickupEnd = new Date(`${watchExpiryDate}T${watchPickupEnd}`);
          setPickupWarning(pickupEnd >= expiry);
        }
      } catch (e) {
        setExpiryWarning(false);
        setPickupWarning(false);
      }
    }
  }, [watchExpiryDate, watchExpiryTime, watchPickupEnd, toast]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      toast({
        variant: "destructive",
        title: "Too many photos",
        description: "You can only upload up to 5 photos.",
      });
      return;
    }
    setPhotos([...photos, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const onSubmit = async (values: DonationFormValues) => {
    if (!isVerified) return;
    if (!coords) {
      toast({
        variant: "destructive",
        title: "Location missing",
        description: "Please allow location access to post a donation.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('foodType', values.foodType);
      formData.append('foodCategory', values.foodCategory);
      formData.append('storageReq', values.storageReq);
      formData.append('quantity', values.quantity);
      formData.append('perishability', values.perishability);
      const combineDateTime = (d: string, t: string) => {
        const [year, month, day] = d.split('-').map(Number);
        const [hours, minutes] = t.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes).toISOString();
      };

      formData.append('expiryDate', combineDateTime(values.expiryDate, values.expiryTime));

      const pickupWindow = {
        start: combineDateTime(values.expiryDate, values.pickupWindowStart),
        end: combineDateTime(values.expiryDate, values.pickupWindowEnd),
      };
      formData.append('pickupWindow', JSON.stringify(pickupWindow));

      formData.append('pickupAddress', values.pickupAddress);

      // Send coordinates as array string [lng, lat]
      formData.append('coordinates', JSON.stringify(coords));

      formData.append('allergens', JSON.stringify(selectedAllergens));
      formData.append('dietaryTags', JSON.stringify(selectedDietary));

      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      await DonationService.createDonation(formData);

      toast({
        title: "Donation Posted!",
        description: "Your surplus food is now available for NGOs.",
      });
      navigate('/donor');
    } catch (error: unknown) {
      console.error('Submission error:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: apiError.response?.data?.message || "Failed to post donation. Check all fields.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <VerificationBanner />
      <PageHeader
        title="Post a Donation"
        description="Share your surplus food with NGOs in your area."
      />

      {expiryWarning && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">Safety Warning: This food expires in less than 2 hours. Please ensure prompt pickup.</p>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start">
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-primary" />
                Food Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
                <Input
                  {...form.register('title')}
                  placeholder="e.g., 20 Packets of Vegetable Pasta"
                  className="h-11"
                  disabled={!isVerified}
                />
                {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Food Type</Label>
                  <Select
                    onValueChange={(val) => form.setValue('foodType', val)}
                    disabled={!isVerified}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.foodType && <p className="text-xs text-destructive">{form.formState.errors.foodType.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</Label>
                  <Input
                    {...form.register('quantity')}
                    placeholder="e.g., 5kg or 20 portions"
                    className="h-11"
                    disabled={!isVerified}
                  />
                  {form.formState.errors.quantity && <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Select onValueChange={(val) => form.setValue('foodCategory', val as "cooked" | "raw" | "packaged")} disabled={!isVerified}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cooked">Cooked Meal (Ready to eat)</SelectItem>
                      <SelectItem value="raw">Raw Ingredients (Needs cooking)</SelectItem>
                      <SelectItem value="packaged">Packaged / Canned</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.foodCategory && <p className="text-xs text-destructive">{form.formState.errors.foodCategory.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Storage</Label>
                  <Select onValueChange={(val) => form.setValue('storageReq', val as "dry" | "cold" | "frozen")} disabled={!isVerified}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Storage needs" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry">Dry / Room Temp</SelectItem>
                      <SelectItem value="cold">Refrigerated (Cold)</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.storageReq && <p className="text-xs text-destructive">{form.formState.errors.storageReq.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea
                  {...form.register('description')}
                  placeholder="Provide more details about the food..."
                  rows={3}
                  className="resize-none"
                  disabled={!isVerified}
                />
                {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Perishability</Label>
                <Select
                  onValueChange={(val: 'high' | 'medium' | 'low') => form.setValue('perishability', val)}
                  defaultValue="medium"
                  disabled={!isVerified}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (Expires very soon)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low (Long shelf life)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Allergens</Label>
                <div className="flex flex-wrap gap-3">
                  {allergensList.map(allergen => (
                    <div key={allergen} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-border/50">
                      <Checkbox
                        id={`allergen-${allergen}`}
                        checked={selectedAllergens.includes(allergen)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedAllergens([...selectedAllergens, allergen]);
                          else setSelectedAllergens(selectedAllergens.filter(a => a !== allergen));
                        }}
                        disabled={!isVerified}
                      />
                      <label htmlFor={`allergen-${allergen}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {allergen}
                      </label>
                    </div>
                  ))}

                  {/* Display added custom allergens */}
                  {selectedAllergens.filter(a => !allergensList.includes(a)).map(custom => (
                    <Badge key={custom} variant="secondary" className="h-9 px-3 flex gap-2 rounded-lg bg-primary/10 text-primary border-primary/20">
                      {custom}
                      <button
                        type="button"
                        onClick={() => setSelectedAllergens(selectedAllergens.filter(a => a !== custom))}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Custom Allergen Input */}
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Other allergen (e.g., Sesame)"
                    value={customAllergen}
                    onChange={(e) => setCustomAllergen(e.target.value)}
                    disabled={!isVerified}
                    className="h-10 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customAllergen.trim()) {
                          if (!selectedAllergens.includes(customAllergen.trim())) {
                            setSelectedAllergens([...selectedAllergens, customAllergen.trim()]);
                          }
                          setCustomAllergen('');
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10"
                    onClick={() => {
                      if (customAllergen.trim()) {
                        if (!selectedAllergens.includes(customAllergen.trim())) {
                          setSelectedAllergens([...selectedAllergens, customAllergen.trim()]);
                        }
                        setCustomAllergen('');
                      }
                    }}
                    disabled={!isVerified || !customAllergen.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dietary Tags</Label>
                <div className="flex flex-wrap gap-3">
                  {dietaryTagsList.map(tag => (
                    <div key={tag} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-border/50">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedDietary.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedDietary([...selectedDietary, tag]);
                          else setSelectedDietary(selectedDietary.filter(t => t !== tag));
                        }}
                        disabled={!isVerified}
                      />
                      <label htmlFor={`tag-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="h-5 w-5 text-primary" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border shadow-sm group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <label className={cn(
                    "aspect-square rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors",
                    !isVerified && "opacity-50 cursor-not-allowed"
                  )}>
                    <Upload className="h-6 w-6 text-primary/60" />
                    <span className="text-[10px] font-bold uppercase mt-1">Add</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                      disabled={!isVerified}
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest text-center">Add up to 5 photos for transparency</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-5 w-5 text-primary" />
                Timing & Expiry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiry Date</Label>
                  <Input
                    type="date"
                    {...form.register('expiryDate')}
                    className="h-11"
                    disabled={!isVerified}
                  />
                  {form.formState.errors.expiryDate && <p className="text-xs text-destructive">{form.formState.errors.expiryDate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiry Time</Label>
                  <Input
                    type="time"
                    {...form.register('expiryTime')}
                    className="h-11"
                    disabled={!isVerified}
                  />
                  {form.formState.errors.expiryTime && <p className="text-xs text-destructive">{form.formState.errors.expiryTime.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pickup Window</Label>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground uppercase">Start Time</Label>
                    <Input
                      type="time"
                      {...form.register('pickupWindowStart')}
                      className="h-11"
                      disabled={!isVerified}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground uppercase">End Time</Label>
                    <Input
                      type="time"
                      {...form.register('pickupWindowEnd')}
                      className="h-11"
                      disabled={!isVerified}
                    />
                  </div>
                </div>
                {pickupWarning ? (
                  <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 animate-in fade-in zoom-in-95 duration-300">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-amber-600 leading-relaxed">
                      Critical Logic Error: The pickup window ends after the food expires. Please ensure food is collected and delivered before its expiry time.
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2 px-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <p className="text-[10px] font-medium text-amber-600/80 italic">
                      Pro Tip: Set the pickup window to end at least 1 hour before expiry for safe redistribution.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5 text-primary" />
                Pickup Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pickup Address</Label>
                <div className="relative">
                  <Input
                    {...form.register('pickupAddress')}
                    placeholder="Search or enter pickup address"
                    className="h-11"
                    disabled={!isVerified}
                  />
                  <MapPin className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                </div>
                {form.formState.errors.pickupAddress && <p className="text-xs text-destructive">{form.formState.errors.pickupAddress.message}</p>}
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                  coords ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                )}>
                  {coords ? <Check className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{coords ? "Precise Location Secured" : "Location Access Required"}</p>
                  <p className="text-xs text-muted-foreground">{coords ? `Coordinates: ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}` : "Please allow location access in your browser"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 h-14 rounded-2xl font-bold "
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isVerified ? "hero" : "secondary"}
              size="lg"
              className="flex-[2] h-14 rounded-2xl text-lg font-black  shadow-2xl shadow-primary/20"
              disabled={isSubmitting || !isVerified}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : isVerified ? (
                'Publish Donation'
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Verify Account
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
