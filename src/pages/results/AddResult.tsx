import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkerMessage, WorkerMessageType } from '@/lib/worker';
import { useWorker } from '@/worker-context';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

type FormValues = {
  name: string;
  file: FileList;
  start: number;
  end: number;
};
export function AddResult() {
  const { register, handleSubmit } = useForm<FormValues>();
  const [fileSubmitted, setFileSubmitted] = useState(false);
  const worker = useWorker();
  const logRef = useRef<HTMLPreElement>();

  const onSubmit = (data: FormValues) => {
    const { file, start, end } = data;
    console.log(data);
    setFileSubmitted(true);
    worker.postMessage({ file: URL.createObjectURL(file[0]), pages: start + '-' + end });
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type == WorkerMessageType.LOG && logRef.current) logRef.current.innerText += e.data.data as string;
    };
    setFileSubmitted(true);
  };
  return (
    <DialogContent className="sm:max-w-[425px]">
      {!fileSubmitted ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add file</DialogTitle>
            <DialogDescription>Here you can upload new KTU result pdf for parsing</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input className="col-span-3" placeholder="Eg: S4 2023" {...register('name', { required: true })} />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <Input
                accept=".pdf"
                type="file"
                className="col-span-3"
                {...register('file', { required: true })}
                //   onChange={(e) => setFile(e.target.files?.[0])}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pages" className="text-right">
                From
              </Label>
              <div className="flex col-start-2 col-span-3 gap-2 align-center">
                <Input
                  id="start"
                  placeholder="Eg: 4"
                  {...register('start', { required: true, validate: (value, formValues) => value < formValues.end })}
                />
                <Label htmlFor="end" className="text-center col-auto  my-auto">
                  To
                </Label>
                <Input
                  id="end"
                  placeholder="Eg: 4"
                  {...register('end', { required: true, validate: (value, formValues) => value > formValues.start })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            {/* <DialogClose asChild> */}
            <Button type="submit">Add file</Button>
            {/* </DialogClose> */}
          </DialogFooter>
        </form>
      ) : (
        <div>
          <DialogHeader>
            <DialogTitle>Processing file</DialogTitle>
            <DialogDescription>File is being processed...</DialogDescription>
          </DialogHeader>
          <pre className="bg-slate-700 rounded-md p-4  w-full h-[15rem] text-slate-100 mb-3"></pre>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit" disabled={fileSubmitted}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      )}
    </DialogContent>
  );
}
