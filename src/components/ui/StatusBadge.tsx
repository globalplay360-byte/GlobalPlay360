// Shim: StatusBadge ha estat fusionat dins Badge. Mantenim aquest fitxer
// per compatibilitat fins que ApplicationsPage es migri al `<Badge status>` directe.
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return <Badge status={status} className={className} />;
}
