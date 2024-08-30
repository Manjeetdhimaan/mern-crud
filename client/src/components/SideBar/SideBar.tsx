import { Form } from 'react-router-dom';

import viteImg from '/vite.svg';
import useTransitionNavigation from '../../hooks/useTransitionNavigation';

export default function SideBar({ sideBarIsOpen, onNavigate }: { sideBarIsOpen: boolean, onNavigate: () => void }) {
    const handleNavigation = useTransitionNavigation();


    const isActive = (path: string) => {
        return path === '/' ? location.pathname === path : location.pathname.includes(path);
    };

    const activeClass = 'text-red-400 hover:text-red-500';
    return (
        <>
            <aside className={`fixed top-0 bg-stone-700 w-[60%] z-10 transition-transform ${sideBarIsOpen ? "translate-x-0" : "translate-x-[-100%]"} sm:w-[40%] lg:translate-x-0 lg:w-1/5 h-screen p-6`}>
                <div className="flex justify-center">
                    <img src={viteImg} alt="" />
                </div>
                <ul className="p-8 text-cyan-50 text-left" onClick={onNavigate}>
                    <li className='py-2'><a className={isActive('/') ? activeClass : undefined} onClick={(e) => handleNavigation(e, '/')} >Home</a></li>
                    <li className='py-2'><a className={isActive('/messages') ? activeClass : undefined} onClick={(e) => handleNavigation(e, '/messages')} >Messages</a></li>
                    <li className='py-2'><a href="">Users</a></li>
                    <li className='py-2'><a href="">Tickets</a></li>
                    <li className='py-2'><a href="">Notices</a></li>
                    <li className='py-2'>
                        <a>
                            <Form action="/logout" method="post">
                                <button className='p-0 bg-transparent outline-none hover:border-transparent'>Logout</button>
                            </Form>
                        </a>
                    </li>
                </ul>
            </aside></>

    )
}