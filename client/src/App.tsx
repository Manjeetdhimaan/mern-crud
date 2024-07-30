import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './App.css';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Layout from './components/Layout/Layout';
import { getUserId, tokenLoader } from './util/auth';
import { Messages } from './pages/Messages/Messages';
import { action as logoutAction } from './pages/Logout/Logout';
import { action as signUpAction } from './pages/Auth/Signup';

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
        loader: getUserId,
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
    element: <Login />
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

export default App;

// TO DO: 
// 1. Keep same payload in frontend and backend according to database in emit and on message service. -DONE
// 2. Update database tables with correct spellings of values inside them.
// 3. Create a common http service and use it throughout the app. - DONE
// 4. Improve login and signup page.
// 5. Create localStorage service - DONE
// 6. Replace fetch function with axios in signup
// 7. Implement pagination on Get Messages