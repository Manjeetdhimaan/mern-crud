import { RouterProvider, createBrowserRouter } from 'react-router-dom';


import './App.css';
import Layout from './components/Layout/Layout';
import { idLoader, tokenLoader } from './util/auth';
import { Messages } from './pages/Messages/Messages';
import Login, { action as authAction } from './pages/Auth/Login';
import { action as logoutAction } from './pages/Logout/Logout';
import { action as signUpAction } from './pages/Auth/Signup';
import Signup from './pages/Auth/Signup';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    // errorElement: <ErrorPage />,
    id: 'root',
    loader: tokenLoader,
    children: [
      { index: true, element: <p>Home page</p> },
      {
        path: 'messages',
        element: <Messages />,
        loader: idLoader,
        children: [
          {
            path: ':conversationId',
            element: <Messages />
          },
        ]
      },

      {
        path: 'logout',
        action: logoutAction,
      },
    ],
  },
  {
    path: 'login',
    element: <Login />,
    action: authAction,
  },
  {
    path: 'sign-up',
    element: <Signup />,
    action: signUpAction,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
