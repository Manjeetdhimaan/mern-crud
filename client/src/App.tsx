import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './App.css';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Layout from './components/Layout/Layout';
import { getUserId, tokenLoader } from './util/auth';
import { Messages } from './pages/Messages/Messages';
import { action as signUpAction } from './pages/Auth/Signup';
import { action as logoutAction } from './pages/Logout/Logout';

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
// # Update database tables with correct spellings of values inside them.
// # Replace fetch function with axios in signup
// # Add user search feature / Only search users which are not in the list
// # navigate to /messages/:conversationID  whenever user clicked on any user name/email to start a new conversation
// # Add animation using framer-motion
// # send files in chat.
// # Add reply feature in chat.
// # Add spinner while loading chats and also show http progress bar using redux.
// # Auto reload previous messages when reached top of container.

// COMPLETED
// # Implement pagination on Get Messages -DONE
// # Create localStorage service - DONE
// # Improve login and signup page. -DONE
// # Create a common http service and use it throughout the app. - DONE
// # Keep same payload in frontend and backend according to database in emit and on message service. -DONE
// # Set expiration time in localStorage properly from JWT token - DONE
// # Show date and time for messages of everyday (eg: which message was sent on which date) -DONE
// # Show username and details with which chatting is going on. -DONE
// # Edit and delete message - Done
