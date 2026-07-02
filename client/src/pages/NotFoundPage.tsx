import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { AtomAnimation } from '@/components/decor/AtomAnimation';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <AtomAnimation className="h-40 w-40 animate-float opacity-60" />
      <h1 className="mt-6 text-6xl font-extrabold text-gradient">404</h1>
      <p className="mt-2 text-xl font-semibold text-white">Бет табылмады</p>
      <p className="mt-2 max-w-sm text-muted">Сіз іздеген бет жоқ немесе орны ауысқан болуы мүмкін.</p>
      <Link to="/" className="mt-6">
        <Button>Басты бетке оралу</Button>
      </Link>
    </div>
  );
}
