import { Sun, Moon, Bell, LogOut, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { getUnreadCount } from '@/mockData/notifications';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Logo } from '@/components/ui/logo';

interface NavbarProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export function Navbar({ onMenuClick, showMenu = false }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = user ? getUnreadCount(user.id) : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Impact', href: '#impact' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + href);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (showMenu) {
    return (
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-background border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          {!isAuthenticated && (
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-primary/10"
          >
            {theme === 'light' ? (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>

          {isAuthenticated && user && (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative hover:bg-primary/10"
                onClick={() => navigate(`/${user.role}/notifications`)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-background">
                    {unreadCount}
                  </span>
                )}
              </Button>

              <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-border/50">
                <div className="text-right">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{user.role}</p>
                </div>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-full ring-2 ring-primary/20 border-2 border-background object-cover"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ml-1"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out",
        isScrolled
          ? "top-4 mx-auto max-w-5xl w-[92%] rounded-full border border-border/40 bg-background/70 backdrop-blur-xl shadow-lg py-1.5"
          : "top-2 lg:top-0 w-full bg-transparent py-4"
      )}
    >
      <div className={cn(
        "container mx-auto px-4 lg:px-6 flex items-center justify-between relative z-10 transition-all duration-500",
        isScrolled ? "h-12" : "h-16"
      )}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo size={isScrolled ? "sm" : "md"} />
            </Link>
          </div>

          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-full"
                >
                  {link.name}
                </button>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-primary/10 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
          </Button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative hover:bg-primary/10"
                onClick={() => navigate(`/${user.role}/notifications`)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-background">
                    {unreadCount}
                  </span>
                )}
              </Button>

              <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-border/50">
                <div className="text-right">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{user.role}</p>
                </div>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-full ring-2 ring-primary/20 border-2 border-background object-cover"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ml-1"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className="rounded-full font-medium hover:bg-white/20"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                className="rounded-full font-medium px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                onClick={() => navigate('/login')}
              >
                Get Started
              </Button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col gap-8 pt-16">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                      <Logo size="md" />
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <button
                        key={link.name}
                        onClick={() => handleNavClick(link.href)}
                        className="flex items-center justify-between px-4 py-4 text-lg font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        {link.name}
                        <ArrowRight className="h-5 w-5 opacity-50" />
                      </button>
                    ))}
                  </nav>
                  <div className="mt-auto flex flex-col gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full h-14"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/login');
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-full h-14 shadow-xl shadow-primary/20"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/login');
                      }}
                    >
                      Get Started Free
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
