import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './App.css';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Layout from './components/Layout/Layout';
import Snackbar from './components/UI/Snackbar/Snackbar';

import { getUserId, tokenLoader } from './util/auth';
import { Messages } from './pages/Messages/Messages';
import { action as signUpAction } from './pages/Auth/Signup';
import { action as logoutAction } from './pages/Logout/Logout';
import { RootState } from './store';
import { closeSnackbar } from './store/ui/snackbar/snackbar-slice';

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
  const dispatch = useDispatch();
  const { message, type, isOpen, duration } = useSelector((state: RootState) => state.snackbar);
  return (
    <>
      {isOpen && message && type && (
        <Snackbar message={message} type={type} duration={duration} onClose={() => dispatch(closeSnackbar())} />
      )}
      <RouterProvider router={router} />
    </>
  )
}

export default App;

// TO DO:
// # Add option to preview and download files.
// # Add user search feature / Only search users which are not in the list.
// # navigate to /messages/:conversationID  whenever user clicked on any user name/email to start a new conversation.
// # Handle form validation properly.
// # Add reply feature in chat.
// # Add animation using framer-motion.
// # Show flag on edited message.
// # Add video and voice chat options
// # Add functionality to mark messages: Delievered and Seen.
// # Replace fetch function with axios in signup.
// # Update database tables with correct spellings of values inside them.
// # Auto reload previous messages when reached top of container. - not important
// # Validation on backend to edit and delete message only by owner
// # Create common service to store and fetch data from localstorage in ENCRYPTED form.
// # Create common service to set and get document title and other meta data.
// # Redirect URL when user tries to access protected routes without login
// # BUG - Web socket connection is failing sometime.

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
// # Add spinner while loading chats and also show http progress bar using redux. - DONE
// # send files in chat. - DONE
// # Create custom hook to make http requests. - DONE
// # Remove any from multer - DONE
// # Bug - Id is not getting attached while sending new file without reloading - DONE
// # Error handling in message sending and show spinner while sending files. - DONE
// # Dont show edit option on files in chat - DONE
// # Show error message when user selects a larger file in messages - DONE
// # Show which user has sent the message in chat. - DONE
// # Show last message sent in every conversation in left section. - DONE
// # Sort conversations list based on last message received or sent. - DONE