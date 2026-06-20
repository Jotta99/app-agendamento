// Formata um número como moeda em Real (R$).
export function formatarMoeda(valor: number | string): string {
  const n = typeof valor === 'string' ? Number(valor) : valor;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// "HH:mm:ss" -> "HH:mm"
export function formatarHora(hora: string): string {
  return hora?.slice(0, 5) ?? '';
}

// Converte minutos em texto amigável: 90 -> "1h30", 60 -> "1h", 45 -> "45min".
export function formatarDuracao(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h && m) return `${h}h${m.toString().padStart(2, '0')}`;
  if (h) return `${h}h`;
  return `${m}min`;
}

// "AAAA-MM-DD" -> Date no fuso local (evita o "voltar um dia" do UTC).
export function dataLocal(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

// "AAAA-MM-DD" -> "sexta-feira, 19 de junho"
export function formatarDataExtensa(iso: string): string {
  return dataLocal(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

// "AAAA-MM-DD" -> "19/06/2026"
export function formatarDataCurta(iso: string): string {
  return dataLocal(iso).toLocaleDateString('pt-BR');
}

// Date -> "AAAA-MM-DD" (fuso local).
export function paraISO(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export function hojeISO(): string {
  return paraISO(new Date());
}

// Soma dias a uma data ISO e devolve nova ISO.
export function somarDias(iso: string, dias: number): string {
  const d = dataLocal(iso);
  d.setDate(d.getDate() + dias);
  return paraISO(d);
}

// Domingo da semana que contém a data (início de semana, padrão pt-BR).
export function inicioDaSemana(iso: string): string {
  const d = dataLocal(iso);
  d.setDate(d.getDate() - d.getDay()); // getDay: 0 = domingo
  return paraISO(d);
}

// Primeiro dia do mês da data informada.
export function inicioDoMes(iso: string): string {
  const d = dataLocal(iso);
  return paraISO(new Date(d.getFullYear(), d.getMonth(), 1));
}

// Soma meses a uma data ISO (mantém o dia 1).
export function somarMeses(iso: string, meses: number): string {
  const d = dataLocal(iso);
  return paraISO(new Date(d.getFullYear(), d.getMonth() + meses, 1));
}

// "AAAA-MM-DD" -> "Junho de 2026"
export function nomeMesAno(iso: string): string {
  return dataLocal(iso).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}

// "AAAA-MM-DD" -> "qua, 19 jun"
export function diaCurto(iso: string): string {
  return dataLocal(iso).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

// Número do dia do mês (1–31).
export function diaDoMes(iso: string): number {
  return dataLocal(iso).getDate();
}

// True se a data ISO pertence ao mesmo mês/ano de referência.
export function mesmoMes(iso: string, refIso: string): boolean {
  const a = dataLocal(iso);
  const b = dataLocal(refIso);
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}
