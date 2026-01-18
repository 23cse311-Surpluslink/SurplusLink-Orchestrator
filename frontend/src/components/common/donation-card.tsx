import { Donation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MapPin, Clock, Package, Calendar } from 'lucide-react';
import { getTimeUntil, formatTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface DonationCardProps {
  donation: Donation;
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
  onCancel?: (id: string) => void;
  onEdit?: (id: string) => void;
  disabled?: boolean;
}

const statusColors: Record<Donation['status'], string> = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  assigned: 'bg-info/10 text-info border-info/30',
  picked: 'bg-primary/10 text-primary border-primary/30',
  delivered: 'bg-success/10 text-success border-success/30',
  expired: 'bg-destructive/10 text-destructive border-destructive/30',
  cancelled: 'bg-muted text-muted-foreground border-muted',
};

export function DonationCard({
  donation,
  showActions = false,
  onAccept,
  onReject,
  onView,
  onCancel,
  onEdit,
  disabled = false
}: DonationCardProps) {
  const timeLeft = getTimeUntil(donation.expiryTime);
  const isUrgent = timeLeft.includes('min') || (timeLeft.includes('h') && parseInt(timeLeft) < 3);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{donation.foodType}</h3>
            <p className="text-sm text-muted-foreground">{donation.donorName}</p>
          </div>
          <Badge className={cn("capitalize border", statusColors[donation.status])}>
            {donation.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{donation.quantity}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{donation.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{donation.pickupWindow}</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 text-sm",
            isUrgent && "text-warning font-medium"
          )}>
            <Clock className="h-4 w-4" />
            <span>{timeLeft}</span>
          </div>
        </div>

        {donation.assignedNgo && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm">
              <span className="text-muted-foreground">Assigned to: </span>
              <span className="font-medium">{donation.assignedNgo}</span>
            </p>
            {donation.assignedVolunteer && (
              <p className="text-sm">
                <span className="text-muted-foreground">Volunteer: </span>
                <span className="font-medium">{donation.assignedVolunteer}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2 pt-0">
          {onAccept && donation.status === 'pending' && (
            <Button
              variant={disabled ? "secondary" : "hero"}
              size="sm"
              className="flex-1"
              onClick={() => onAccept(donation.id)}
              disabled={disabled}
            >
              Accept
            </Button>
          )}
          {onReject && donation.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onReject(donation.id)}
              disabled={disabled}
            >
              Reject
            </Button>
          )}
          {onView && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onView(donation.id)}
              disabled={disabled}
            >
              View
            </Button>
          )}
          {onEdit && donation.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(donation.id)}
              disabled={disabled}
            >
              Edit
            </Button>
          )}
          {onCancel && donation.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onCancel(donation.id)}
              disabled={disabled}
            >
              Cancel
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
