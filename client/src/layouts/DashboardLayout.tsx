import { Award, BookOpen, FlaskConical, LayoutDashboard } from 'lucide-react';
import { SidebarLayout, type NavItem } from './SidebarLayout';

const items: NavItem[] = [
  { to: '/dashboard', label: 'Басты бет', icon: LayoutDashboard, end: true },
  { to: '/topics', label: 'Тақырыптар', icon: BookOpen },
  { to: '/labs', label: 'Зертханалар', icon: FlaskConical },
  { to: '/achievements', label: 'Жетістіктер', icon: Award },
];

export function DashboardLayout() {
  return <SidebarLayout items={items} title="Жеке кабинет" homeLink="/dashboard" />;
}
