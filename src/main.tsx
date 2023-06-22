import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import './styles/index.css';

const worker = new Worker(new URL('./lib/worker.ts', import.meta.url), {
  /* @vite-ignore */ type: import.meta.env.PROD ? 'classic' : 'module',
});

const WorkerContext = React.createContext(worker);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WorkerContext.Provider value={worker}>
      <RouterProvider router={router} />
    </WorkerContext.Provider>
  </React.StrictMode>,
);
