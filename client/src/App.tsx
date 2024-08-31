import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './App.css';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Layout from './components/Layout/Layout';
import Snackbar from './components/UI/Snackbar/Snackbar';
import HttpProgressBar from './components/UI/Nprogress/Nprogress';

import { tokenLoader } from './util/auth';
import { Messages } from './pages/Messages/Messages';
import { action as signUpAction } from './pages/Auth/Signup';
import { action as logoutAction } from './pages/Logout/Logout';
import { RootState } from './store';
import { closeSnackbar } from './store/ui/snackbar/snackbar-slice';
import PageNotFound from './components/PageNotFound/PageNotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <Snackbar message="An error occured" type="error" duration={3000} onClose={() => null} />,
    id: 'root',
    loader: tokenLoader,
    children: [
      { index: true, element: <p>Home page</p> },
      {
        path: 'messages',
        element: <Messages />,
        // loader: conversationLoader,
        children: [
          {
            path: ':conversationId',
            element: <Messages />,
          },
        ]
      },
      {
        path: 'logout',
        action: logoutAction,
      },
      {
        path: '*',
        element: <PageNotFound />
      }
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
      <HttpProgressBar />
      {isOpen && message && type && (
        <Snackbar message={message} type={type} duration={duration} onClose={() => dispatch(closeSnackbar())} />
      )}
     

      <RouterProvider router={router} />
    </>
  )
}

export default App;

// TO DO:
// # Add video and voice chat options
// # Add functionality to mark messages: Delievered and Seen.
// # Add reply feature in chat.
// # Make mobile responsive
// # Delete all messages of conversation when deleting a conversation
// # Add option to preview and download files.
// # Validation on backend to edit and delete message only by owner
// # Update database tables with correct spellings of values inside them.
// # Handle form validation properly.
// # Add animation using framer-motion.
// # Show flag on edited message.
// # Replace fetch function with axios in signup.
// # Auto reload previous messages when reached top of container. - not important
// # Create common service to store and fetch data from localstorage in ENCRYPTED form.
// # Create common service to set and get document title and other meta data.
// # Redirect URL when user tries to access protected routes without login
// # BUG - Web socket connection is failing sometime.
// # Search filter should be on backend
// # Detect Hyper links sent in chat and show them as clickable links

// # Make mobile responsive ----
//                             |---login page
//                             |---side bar
//                             |---chatting page
//                             |---Layout page


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
// # Add user search feature / Only search users which are not in the list. - DONE
// # navigate to /messages/:conversationID  whenever user clicked on any user name/email to start a new conversation. - DONE
// # Implement search functionality in conversations list - DONE