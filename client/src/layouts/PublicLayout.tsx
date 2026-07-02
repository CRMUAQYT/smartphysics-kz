import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/services/endpoints';
import { cn } from '@/utils/cn';

const NAV = [
  { to: '/', label: 'Басты бет', end: true },
  { to: '/topics', label: 'Тақырыптар' },
  { to: '/labs', label: 'Зертханалар' },
];

export function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, clear } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clear();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled ? 'border-b border-white/10 bg-background/80 backdrop-blur-xl' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-slate-300 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/achievements"
                className={({ isActive }) =>
                  cn('rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'text-primary' : 'text-slate-300 hover:text-white')
                }
              >
                Жетістіктер
              </NavLink>
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}>
                  <Button variant="secondary" size="sm">
                    <LayoutDashboard className="h-4 w-4" />
                    {user?.role === 'ADMIN' ? 'Админ' : 'Кабинет'}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} aria-label="Шығу">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Кіру
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Тіркелу</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-white md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Мәзір"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 bg-background-secondary/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-1 p-4">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn('rounded-lg px-3 py-3 text-sm font-medium', isActive ? 'bg-primary/10 text-primary' : 'text-slate-300')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                  {isAuthenticated ? (
                    <>
                      <Link to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} onClick={() => setMenuOpen(false)}>
                        <Button variant="secondary" fullWidth>
                          {user?.role === 'ADMIN' ? 'Админ панель' : 'Жеке кабинет'}
                        </Button>
                      </Link>
                      <Button variant="ghost" fullWidth onClick={logout}>
                        Шығу
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        <Button variant="ghost" fullWidth>
                          Кіру
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setMenuOpen(false)}>
                        <Button fullWidth>Тіркелу</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background-secondary/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            7-сынып физикасын интерактивті тәжірибелер, анимациялар және қызықты тапсырмалар арқылы үйрен.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Платформа</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/topics" className="hover:text-primary">Тақырыптар</Link></li>
            <li><Link to="/labs" className="hover:text-primary">Зертханалар</Link></li>
            <li><Link to="/register" className="hover:text-primary">Тіркелу</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Ресурстар</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="/api/docs" className="hover:text-primary">API құжаттамасы</a></li>
            <li><span className="text-muted/70">7-сынып бағдарламасы</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} SmartPhysics KZ. Барлық құқықтар қорғалған.
      </div>
    </footer>
  );
}
