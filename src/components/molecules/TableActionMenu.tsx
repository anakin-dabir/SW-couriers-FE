import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/molecules/dropdown-menu';
import { TableActionButton } from '@/components/atoms';
import { Typography } from '@/components/atoms';

interface TableAction {
  /** Action label */
  label: string;
  /** Action handler */
  onClick: () => void;
  /** Whether action is disabled */
  disabled?: boolean;
}

interface TableActionMenuProps {
  /** Array of actions to display */
  actions: TableAction[];
}

/**
 * Molecule component for table row action menu
 * Combines action button with dropdown menu
 */
export default function TableActionMenu({ actions }: TableActionMenuProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <TableActionButton />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            disabled={action.disabled}
            className="cursor-pointer"
          >
            <Typography variant="caption">{action.label}</Typography>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
