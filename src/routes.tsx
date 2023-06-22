import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Layout from './layouts/layout';
import Results from './pages/results/results';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/results',
        element: <Results />,
      },
    ],
  },
]);

export default router;
