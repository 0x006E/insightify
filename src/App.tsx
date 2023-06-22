import { createRef, useState } from 'react';
import 'react-json-view-lite/dist/index.css';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

function App() {
  // const [result, setResult] = useState<Record<string, never>>();
  // const [file, setFile] = useState<File | null>();
  const [pages, setPages] = useState<string>('');
  const logRef = createRef<HTMLPreElement>();
  // const [progress, setProgress] = useState(0);

  // const handleSubmit = () => {
  //   if (!file) return;
  //   parser.postMessage({ file: URL.createObjectURL(file), pages: pages });
  // };

  // useEffect(() => {
  //   if (window.Worker) {
  //     parser.onmessage = (
  //       e: MessageEvent<{ type?: string; result: string; parsed: Record<string, never>; total: number }>,
  //     ) => {
  //       logRef.current?.scrollTo(0, logRef.current.scrollHeight);
  //       if (e.data.type === 'progress') {
  //         setProgress((Number(e.data.result) / Number(e.data.total)) * 100);
  //         return;
  //       }
  //       if (e.data.result === 'Exit') {
  //         setResult(e.data.parsed);
  //         console.log('Worker exited');
  //         return;
  //       }
  //       if (logRef.current !== null) logRef.current.innerText += `${e.data.result}\n`;
  //     };
  //   }
  // }, [parser, logRef]);

  return (
    <div className="p-4 flex-1">
      <h1>Vite + React</h1>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">File</Label>
        <div className="w-full max-w-sm items-center space-x-2 p-2">
          <Input accept=".pdf" type="file" />
          <Input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Pages" />
        </div>
      </div>
      <pre className="card" ref={logRef} style={{ height: '50vh', overflowY: 'auto' }}></pre>
      {/* <Progress value={progress} className="w-[60%]" /> */}

      {/* {result && <JsonView data={result} style={defaultStyles} shouldInitiallyExpand={(_) => false} />} */}
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </div>
  );
}

export default App;
