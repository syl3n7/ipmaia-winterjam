"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/gamejams', label: '🎮 Game Jams', section: 'gamejams' },
    { href: '/admin/games', label: '🎯 Jogos', section: 'games' },
    { href: '/admin/sponsors', label: '💰 Patrocinadores', section: 'sponsors' },
    { href: '/admin/users', label: '👥 Utilizadores', section: 'users' },
    { href: '/admin/frontpage', label: '🏠 Página Inicial', section: 'frontpage' },
    { href: '/admin/rules', label: '📋 Regras', section: 'rules' },
    { href: '/admin/system', label: '⚙️ Sistema', section: 'system' },
  ];

  return (
    <div className="container">
      <div className="header">
        <h1>🎮 Painel de Administração IPMAIA WinterJam</h1>
        <p>Sistema de Gestão de Conteúdo Completo</p>
        {/* User info and status can be added here */}
      </div>

      {/* Navigation */}
      <div className="nav">
        {navItems.map((item) => (
          <Link key={item.section} href={item.href}>
            <button
              className={`nav-btn ${pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </button>
          </Link>
        ))}
      </div>

      <main>{children}</main>
    </div>
  );
}