export interface NavItem {
  nome: string;
  rota: string;
  icone: string; // path do SVG (dentro de <path d="...">)
}

export const navItems: NavItem[] = [
  {
    nome: 'Dashboard',
    rota: '/dashboard',
    icone:
      'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1V10',
  },
  {
    nome: 'Agenda',
    rota: '/agenda',
    icone:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    nome: 'Clientes',
    rota: '/clientes',
    icone:
      'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z',
  },
  {
    nome: 'Serviços',
    rota: '/servicos',
    icone:
      'M11 4a4 4 0 014 4 4 4 0 01-1.17 2.83l8.34 8.34-2.83 2.83-8.34-8.34A4 4 0 014 11a4 4 0 016-3.46',
  },
];
