import React from 'react';

const worker = new Worker(new URL('./lib/worker.ts', import.meta.url), {
  /* @vite-ignore */ type: import.meta.env.PROD ? 'classic' : 'module',
});

const WorkerContext = React.createContext(worker);

const WorkerProvider = ({ children }: { children: React.ReactNode }) => {
  return <WorkerContext.Provider value={worker}>{children}</WorkerContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWorker = () => {
  const context = React.useContext(WorkerContext);
  if (context === undefined) {
    throw new Error('useWorker must be used within a WorkerProvider');
  }
  return context;
};
export default WorkerProvider;
