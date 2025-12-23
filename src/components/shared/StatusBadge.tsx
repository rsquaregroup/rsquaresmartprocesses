import { Badge } from '@/components/ui/badge';
import { badgeVariants } from '@/components/ui/badge-variants';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

type Status = 
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'pre-approved'
  | 'pending-landlord'
  | 'landlord-approved'
  | 'landlord-rejected'
  | 'rejected'
  | 'approved'
  | 'accepted'
  | 'cancelled'
  | 'active'
  | 'inactive';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

interface StatusBadgeProps {
  status: Status;
  className?: string;
  label?: string;
}

const statusConfig: Record<Status, { label: string; variant: BadgeVariant; className: string }> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    className: 'bg-secondary text-secondary-foreground',
  },
  submitted: {
    label: 'Submitted',
    variant: 'awaiting_approval',
    className: 'border-transparent bg-[#FEE1C7] text-[#A04C03]',
  },
  in_review: {
    label: 'In Review',
    variant: 'awaiting_approval',
    className: 'border-transparent bg-[#FEE1C7] text-[#A04C03]',
  },
  'pre-approved': {
    label: 'Pre-Approved',
    variant: 'default',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  'pending-landlord': {
    label: 'Validation',
    variant: 'awaiting_approval',
    className: 'border-transparent bg-[#FEE1C7] text-[#A04C03]',
  },
  'landlord-approved': {
    label: 'Accepted',
    variant: 'approved',
    className: 'border-transparent bg-[#DCFAF5] text-[#127D6B]',
  },
  'landlord-rejected': {
    label: 'Refused',
    variant: 'rejected',
    className: 'border-transparent bg-[#FCEAEA] text-[#B60909]',
  },
  rejected: {
    label: 'Rejected',
    variant: 'rejected',
    className: 'border-transparent bg-[#FCEAEA] text-[#B60909]',
  },
  approved: {
    label: 'Accepted',
    variant: 'approved',
    className: 'border-transparent bg-[#DCFAF5] text-[#127D6B]',
  },
  accepted: {
    label: 'Accepted',
    variant: 'approved',
    className: 'border-transparent bg-[#DCFAF5] text-[#127D6B]',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground',
  },
  active: {
    label: 'Active',
    variant: 'default',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 font-normal',
  },
  inactive: {
    label: 'Inactive',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground',
  },
};

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const badgeLabel = label ?? config.label;

  return (
    <Badge
      variant={config.variant}
      className={cn('font-medium border', config.className, className)}
    >
      {badgeLabel}
    </Badge>
  );
}
