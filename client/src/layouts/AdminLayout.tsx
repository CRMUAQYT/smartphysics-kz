import { BookOpen, LayoutDashboard, Users } from 'lucide-react';
import { SidebarLayout, type NavItem } from './SidebarLayout';

const items: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/topics', label: 'Тақырыптар', icon: BookOpen },
  { to: '/admin/students', label: 'Оқушылар', icon: Users },
];

export function AdminLayout() {
  return <SidebarLayout items={items} title="Админ панель" homeLink="/admin" />;
}
