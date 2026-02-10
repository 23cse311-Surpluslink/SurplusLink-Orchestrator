import { Sun, Moon, Bell, LogOut, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

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


  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    // { name: 'Impact', href: '#impact' },
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
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4 hidden lg:block" />
          <div className="hidden lg:block">
            <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dashboard</h1>
          </div>

          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-full uppercase tracking-wider"
              >
                {link.name}
              </button>
            ))}
          </nav>
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
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 pt-4">
      <div
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-500 ease-in-out rounded-full",
          isScrolled
            ? "bg-background/80 backdrop-blur-md border border-border/40 shadow-sm max-w-5xl px-6 py-2.5"
            : "bg-transparent w-full max-w-7xl px-4 lg:px-0 py-4 border border-transparent"
        )}

      >

        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={isScrolled ? "sm" : "md"} />
          </Link>

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
            <Button
              className="rounded-full px-7 bg-foreground text-background hover:bg-foreground/90 hover:scale-105 border-none transition-all font-bold shadow-2xl dark:shadow-white/20 shadow-black/20"
              onClick={() => navigate(`/${user.role}`)}
            >
              Dashboard
            </Button>
          ) : (
            <div className="hidden md:flex items-center gap-3">

              <Button
                className="rounded-full font-medium px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                onClick={() => navigate('/login')}
              >
                Get Started
              </Button>
            </div>
          )}

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
                  {isAuthenticated && user && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(`/${user.role}`);
                      }}
                      className="flex items-center justify-between px-4 py-4 text-lg font-bold text-primary bg-primary/10 rounded-xl"
                    >
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  )}
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
                  {!isAuthenticated ? (
                    <>
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
                    </>
                  ) : (
                    <Button
                      size="lg"
                      className="rounded-full h-14 shadow-xl shadow-primary/20"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                    >
                      Log Out
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
