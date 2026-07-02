import { ReactNode, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/services/endpoints';
import { cn } from '@/utils/cn';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface SidebarLayoutProps {
  items: NavItem[];
  title: string;
  homeLink: string;
  headerExtra?: ReactNode;
}

/** Responsive shell: fixed sidebar on desktop, slide-in drawer on mobile. */
export function SidebarLayout({ items, title, homeLink, headerExtra }: SidebarLayoutProps) {
  const [open, setOpen] = useState(false);
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clear();
    navigate('/');
  };

  const NavList = () => (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary/15 text-primary shadow-glow' : 'text-slate-300 hover:bg-white/5 hover:text-white',
            )
          }
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const SidebarInner = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        <Logo to={homeLink} />
      </div>
      <NavList />
      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
            {user?.fullName?.[0] ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" fullWidth size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Шығу
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-background-secondary/60 backdrop-blur-xl lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarInner />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-background-secondary lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <SidebarInner />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            className="rounded-lg p-2 text-white lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Мәзірді ашу"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            {headerExtra}
            <Link to="/" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Сайтқа
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
