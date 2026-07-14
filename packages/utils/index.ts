export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return dateString;
  }
}

export function formatFullDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
  } catch (e) {
    return dateString;
  }
}

export function getStatusColor(status: string): string {
  const norm = String(status).toLowerCase();
  switch (norm) {
    case 'active':
      return 'bg-brandRose/10 text-brandRose border-brandRose/20';
    case 'investigating':
      return 'bg-brandAmber/10 text-brandAmber border-brandAmber/20';
    case 'mitigating':
      return 'bg-brandPurple/10 text-brandPurple border-brandPurple/20';
    case 'resolved':
      return 'bg-brandEmerald/10 text-brandEmerald border-brandEmerald/20';
    default:
      return 'bg-zinc-800/10 text-zinc-400 border-zinc-700/20';
  }
}

export function getSeverityColor(severity: string): string {
  const norm = String(severity).toUpperCase();
  switch (norm) {
    case 'P1':
    case 'CRITICAL':
      return 'text-brandRose border-brandRose/20 bg-brandRose/10';
    case 'P2':
    case 'WARNING':
      return 'text-brandAmber border-brandAmber/20 bg-brandAmber/10';
    case 'P3':
    case 'INFO':
      return 'text-brandCyan border-brandCyan/20 bg-brandCyan/10';
    default:
      return 'text-zinc-400 border-zinc-800 bg-zinc-900';
  }
}
