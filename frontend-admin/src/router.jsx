import { createBrowserRouter, Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Shell from './components/layout/Shell';
import LoginPage from './pages/login/LoginPage';
import EventListPage from './pages/events/EventListPage';
import EventEditorPage from './pages/editor/EventEditorPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <Shell />,
        children: [
          { index: true, element: <Navigate to="/events" replace /> },
          { path: 'events', element: <EventListPage /> },
          { path: 'events/new', element: <EventEditorPage mode="create" /> },
          { path: 'events/:eventId', element: <EventEditorPage mode="edit" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/events" replace /> },
]);

export default router;
