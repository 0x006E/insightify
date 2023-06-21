import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createRef, useEffect, useMemo, useState } from 'react';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import reactLogo from './assets/react.svg';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

function App() {
  const parser: Worker = useMemo(() => new Worker(new URL('./lib/worker.ts', import.meta.url)), []);
  const [result, setResult] = useState<Record<string, never>>();
  const [file, setFile] = useState<File | null>();
  const [pages, setPages] = useState<string>('');
  const logRef = createRef<HTMLPreElement>();
  const [progress, setProgress] = useState(0);

  const handleSubmit = () => {
    if (!file) return;
    parser.postMessage({ file: URL.createObjectURL(file), pages: pages });
  };

  useEffect(() => {
    if (window.Worker) {
      parser.onmessage = (
        e: MessageEvent<{ type?: string; result: string; parsed: Record<string, never>; total: number }>,
      ) => {
        logRef.current?.scrollTo(0, logRef.current.scrollHeight);
        if (e.data.type === 'progress') {
          setProgress((Number(e.data.result) / Number(e.data.total)) * 100);
          return;
        }
        if (e.data.result === 'Exit') {
          setResult(e.data.parsed);
          console.log('Worker exited');
          return;
        }
        if (logRef.current !== null) logRef.current.innerText += `${e.data.result}\n`;
      };
    }
  }, [parser, logRef]);

  return (
    <div className="p-4">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Button
        variant="outline"
        onClick={() => {
          indexedDB.deleteDatabase('/wheels');
          window.location.reload();
        }}
      >
        Clear cache
      </Button>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">File</Label>
        <div className="w-full max-w-sm items-center space-x-2 p-2">
          <Input accept=".pdf" type="file" onChange={(e) => setFile(e.target.files?.[0])} />
          <Input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Pages" />
          <Button type="submit" onClick={handleSubmit}>
            Upload
          </Button>
        </div>
      </div>
      <pre className="card" ref={logRef} style={{ height: '50vh', overflowY: 'auto' }}></pre>
      <Progress value={progress} className="w-[60%]" />

      {result && <JsonView data={result} style={defaultStyles} shouldInitiallyExpand={(_) => false} />}
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </div>
  );
}

export default App;
