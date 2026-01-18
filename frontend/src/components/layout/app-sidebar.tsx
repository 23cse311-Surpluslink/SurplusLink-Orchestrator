import * as React from "react"
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
    ChevronsUpDown,
    LogOut,
    User as UserIcon,
    Settings,
    Sparkles,
} from "lucide-react"
import api from "@/lib/api"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/ui/logo"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import { Link, useLocation, useNavigate } from "react-router-dom"

const navItemsByRole = {
    donor: [
        { label: "Dashboard", href: "/donor", icon: Home },
        { label: "Post Donation", href: "/donor/post", icon: PlusCircle },
        { label: "My Donations", href: "/donor/donations", icon: List },
        { label: "Notifications", href: "/donor/notifications", icon: Bell },
        { label: "Impact Summary", href: "/donor/impact", icon: BarChart3 },
    ],
    ngo: [
        { label: "Dashboard", href: "/ngo", icon: Home },
        { label: "Nearby Donations", href: "/ngo/nearby", icon: MapPin },
        { label: "Accepted Donations", href: "/ngo/accepted", icon: CheckSquare },
        { label: "Volunteer View", href: "/ngo/volunteers", icon: Users },
        { label: "Notifications", href: "/ngo/notifications", icon: Bell },
        { label: "Feedback", href: "/ngo/feedback", icon: MessageSquare },
        { label: "Impact Metrics", href: "/ngo/impact", icon: BarChart3 },
    ],
    admin: [
        { label: "Dashboard", href: "/admin", icon: Home },
        { label: "User Management", href: "/admin/users", icon: Users },
        { label: "System Reports", href: "/admin/reports", icon: FileText },
        { label: "Live Tracking", href: "/admin/tracking", icon: Truck },
        { label: "Notifications", href: "/admin/notifications", icon: Bell },
        { label: "Moderation", href: "/admin/moderation", icon: ShieldCheck },
    ],
    volunteer: [
        { label: "My Tasks", href: "/volunteer", icon: Truck },
        { label: "Available Jobs", href: "/volunteer/available", icon: MapPin },
        { label: "Mission History", href: "/volunteer/history", icon: List },
        { label: "Notifications", href: "/volunteer/notifications", icon: Bell },
    ],
}

export function AppSidebar({ role }: { role: UserRole }) {
    const { user, logout } = useAuth()
    const { state } = useSidebar()
    const location = useLocation()
    const navigate = useNavigate()
    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
    const [pendingCount, setPendingCount] = React.useState(0)
    const navItems = navItemsByRole[role] || []

    const fetchPending = async () => {
        if (role === 'admin') {
            try {
                const { data } = await api.get('/users/admin/pending');
                const nonAdminPending = data.filter((u: { role: string }) => u.role !== 'admin');
                setPendingCount(nonAdminPending.length);
            } catch (error) {
                console.error('Error fetching pending count:', error);
            }
        }
    };

    React.useEffect(() => {
        fetchPending();
        if (role === 'admin') {
            const interval = setInterval(fetchPending, 10000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    const isCollapsed = state === "collapsed"

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="group-data-[collapsible=icon]:!p-0">
                            <Link to="/" className="flex items-center justify-center w-full">
                                <Logo size={isCollapsed ? "md" : "sm"} showText={!isCollapsed} />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.href}
                                        tooltip={item.label}
                                        size="lg"
                                        className="h-11 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
                                    >
                                        <Link
                                            to={item.href}
                                            className="flex items-center w-full px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
                                        >
                                            <item.icon className="!size-5 shrink-0" />
                                            <span className="text-sm font-medium ml-3 group-data-[collapsible=icon]:hidden">
                                                {item.label}
                                            </span>
                                            {item.label === "User Management" && pendingCount > 0 && (
                                                <span className="ml-auto flex h-2 w-2 rounded-full bg-orange-500 animate-pulse group-data-[collapsible=icon]:hidden" />
                                            )}
                                            {item.label === "User Management" && pendingCount > 0 && isCollapsed && (
                                                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {!isCollapsed && (
                    <SidebarGroup className="mt-auto px-4 pb-4">
                        <SidebarGroupContent>
                            <div className="rounded-2xl bg-primary/5 p-5 border border-primary/10 transition-all hover:bg-primary/10">
                                <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <Sparkles className="size-3.5 fill-primary/20" />
                                    Pro Tip
                                </p>
                                <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
                                    {role === 'donor' && 'Post donations early for faster pickup matches.'}
                                    {role === 'ngo' && 'Accept nearby donations first for quicker delivery.'}
                                    {role === 'volunteer' && 'Safety first! Always check food timestamps.'}
                                    {role === 'admin' && 'Monitor KPIs daily to ensure system efficiency.'}
                                </p>
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user?.avatar} alt={user?.name} />
                                        <AvatarFallback className="rounded-lg">
                                            {user?.name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold">{user?.organization || user?.name}</span>
                                        <span className="truncate text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.avatar} alt={user?.name} />
                                            <AvatarFallback className="rounded-lg">
                                                {user?.name?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.organization || user?.name}</span>
                                            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer">
                                        <UserIcon className="mr-2 size-4" />
                                        Account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                                        <Settings className="mr-2 size-4" />
                                        Settings
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => setShowLogoutDialog(true)} className="text-destructive cursor-pointer hover:bg-white/80 ">
                                    <LogOut className="mr-2 size-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className="rounded-2xl border-border/50 backdrop-blur-md bg-card/95">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground font-medium">
                            This will end your current session and you will need to sign in again to access your workspace.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-wider h-11 border-none hover:bg-muted transition-colors">
                            Stay Signed In
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={logout}
                            className="rounded-xl font-bold uppercase tracking-wider h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
                        >
                            Log Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sidebar>
    )
}
