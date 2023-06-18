import { createRef, useEffect, useMemo, useState } from 'react';
import reactLogo from './assets/react.svg';

function App() {
  const parser: Worker = useMemo(() => new Worker(new URL('./lib/worker.ts', import.meta.url), { type: 'module' }), []);
  const [result, setResult] = useState<string>('');
  const logRef = createRef<HTMLDivElement>();
  useEffect(() => {
    if (window.Worker) {
      parser.postMessage('');
    }
  }, [parser]);

  useEffect(() => {
    if (window.Worker) {
      parser.onmessage = (e: MessageEvent<{ result: string; parsed: string }>) => {
        if (e.data.result === 'Exit') {
          setResult(e.data.parsed);
          parser.terminate();
          console.log('Worker terminated');
          return;
        }
        if (logRef.current !== null) logRef.current.innerText += `${e.data.parsed ? e.data.parsed : e.data.result}\n`;
      };
    }
  }, [parser, logRef]);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <button
        onClick={() => {
          indexedDB.deleteDatabase('/wheels');
          window.location.reload();
        }}
      >
        Clear cache
      </button>
      <div className="card" ref={logRef}></div>
      {result && <pre>{result}</pre>}
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
