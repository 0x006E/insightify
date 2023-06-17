import { useEffect, useMemo, useState } from 'react';
import reactLogo from './assets/react.svg';

function App() {
  const [count, setCount] = useState<string[]>([]);
  const parser: Worker = useMemo(() => new Worker(new URL('./lib/worker.ts', import.meta.url), { type: 'module' }), []);

  useEffect(() => {
    if (window.Worker) {
      parser.postMessage('');
    }
  }, [parser]);

  useEffect(() => {
    if (window.Worker) {
      parser.onmessage = (e: MessageEvent<{ result: string; _parsed: Record<string, string> }>) => {
        setCount((prev) => [...prev, e.data._parsed ? JSON.stringify(e.data._parsed) : e.data.result]);
      };
    }
  }, [parser]);

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
      <div className="card">
        <ul>{count.length > 0 && count.map((item, index) => <li key={index}>{item}</li>)}</ul>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
