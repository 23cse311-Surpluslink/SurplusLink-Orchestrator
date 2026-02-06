import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  List,
  Bell,
  BarChart3,
  MapPin,
  CheckSquare,
  Users,
  MessageSquare,
  FileText,
  Truck,
  ShieldCheck,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const donorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/donor', icon: Home },
  { label: 'Post Donation', href: '/donor/post', icon: PlusCircle },
  { label: 'My Donations', href: '/donor/donations', icon: List },
  { label: 'Notifications', href: '/donor/notifications', icon: Bell },
  { label: 'Impact Summary', href: '/donor/impact', icon: BarChart3 },
];

const ngoNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/ngo', icon: Home },
  { label: 'Nearby Donations', href: '/ngo/nearby', icon: MapPin },
  { label: 'Accepted Donations', href: '/ngo/accepted', icon: CheckSquare },
  { label: 'Volunteer View', href: '/ngo/volunteers', icon: Users },
  { label: 'Notifications', href: '/ngo/notifications', icon: Bell },
  { label: 'Feedback', href: '/ngo/feedback', icon: MessageSquare },
  { label: 'Impact Metrics', href: '/ngo/impact', icon: BarChart3 },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'System Reports', href: '/admin/reports', icon: FileText },
  { label: 'Live Tracking', href: '/admin/tracking', icon: Truck },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Moderation', href: '/admin/moderation', icon: ShieldCheck },
];

const volunteerNavItems: NavItem[] = [
  { label: 'My Tasks', href: '/volunteer', icon: Truck },
  { label: 'Available Jobs', href: '/volunteer/available', icon: MapPin },
  { label: 'Mission History', href: '/volunteer/history', icon: List },
  { label: 'Notifications', href: '/volunteer/notifications', icon: Bell },
];

const navItemsByRole: Record<UserRole, NavItem[]> = {
  donor: donorNavItems,
  ngo: ngoNavItems,
  admin: adminNavItems,
  volunteer: volunteerNavItems,
};

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navItems = navItemsByRole[role];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link to={`/${role}`} className="flex items-center gap-2">
            <Logo size="sm" showText={true} />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent p-4">
            <p className="text-xs font-medium text-sidebar-foreground mb-1">
              Pro Tip
            </p>
            <p className="text-xs text-muted-foreground">
              {role === 'donor' && 'Post donations early for faster pickup matches.'}
              {role === 'ngo' && 'Accept nearby donations first for quicker delivery.'}
              {role === 'volunteer' && 'Safety first! Always check food timestamps.'}
              {role === 'admin' && 'Monitor KPIs daily to ensure system efficiency.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
