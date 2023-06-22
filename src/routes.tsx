import { Navigate, createBrowserRouter } from 'react-router-dom';
import Layout from './layouts/layout';
import Results from './pages/results/results';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/results" />,
      },
      {
        path: '/results',
        element: <Results />,
      },
    ],
  },
]);

export default router;
