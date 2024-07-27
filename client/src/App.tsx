import './App.css';
import { Layout } from './components/Layout/Layout';
import { Messages } from './pages/Messages/Messages';

function App() {
  return (
    <>
      <Layout />
      <main className='fixed top-0 left-[20%]'>
        <Messages />
      </main>
    </>
  )
}

export default App
