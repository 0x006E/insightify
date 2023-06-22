import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { Dialog } from '@radix-ui/react-dialog';
import { Plus } from 'lucide-react';
import { AddResult } from './AddResult';
import { Result, columns } from './columns';
import { DataTable } from './data-table';

export default function Results() {
  const data: Result[] = [
    {
      name: 'S4 2023',
      date: new Date(),
    },
    {
      name: 'S6 2023',
      date: new Date(),
    },
    // ...
  ];

  return (
    <div className="px-8 w-full flex flex-col">
      <h1 className="text-2xl font-semibold pt-10">Results</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="justify-self-center self-end">
            <Plus className="w-4 h-4" />
            &nbsp;Upload
          </Button>
        </DialogTrigger>
        <AddResult />
      </Dialog>

      <div className="w-full pt-5">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
