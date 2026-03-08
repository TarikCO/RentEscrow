import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EscrowContract } from "@/types/escrow";

interface EscrowTableProps {
  escrows: EscrowContract[];
  onSelect: (escrow: EscrowContract) => void;
}

const format = (address: string) => `${address.slice(0, 8)}...${address.slice(-4)}`;

const EscrowTable = ({ escrows, onSelect }: EscrowTableProps) => {
  return (
<<<<<<< HEAD
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/55 p-2 text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
=======
    <div className="rounded-xl border border-stone-300/80 bg-white/90 p-2 shadow-lg shadow-slate-900/5">
>>>>>>> b14b8433d5e8c04454c2622ac97c931bd7b5f35d
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead>Yield</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Landlord</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {escrows.map((escrow) => (
            <TableRow
              key={escrow.address}
              className="cursor-pointer"
              onClick={() => onSelect(escrow)}
            >
              <TableCell className="font-mono text-xs">{format(escrow.address)}</TableCell>
              <TableCell>{escrow.rentAmountEth} ETH</TableCell>
              <TableCell>{escrow.yieldPercent}%</TableCell>
              <TableCell className="font-mono text-xs">{format(escrow.tenant)}</TableCell>
              <TableCell className="font-mono text-xs">{format(escrow.landlord)}</TableCell>
              <TableCell className="capitalize">{escrow.status}</TableCell>
              <TableCell>{new Date(escrow.deadline).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EscrowTable;
