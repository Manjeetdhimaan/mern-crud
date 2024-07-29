import { Form, NavLink } from 'react-router-dom'
import viteImg from '/vite.svg'

export default function SideBar() {
    const activeClass = 'text-red-400 underline'
    return (
        <aside className="bg-stone-700 w-1/5 h-screen p-6">
            <div className="flex justify-center">
                <img src={viteImg} alt="" />
            </div>
            <ul className="p-8 text-cyan-50 text-left">
                <li className='py-2'><NavLink to="/" className={({ isActive }) => isActive ? activeClass : undefined}>Home</NavLink></li>
                <li className='py-2'><NavLink to="/messages" className={({ isActive }) => isActive ? activeClass : undefined}>Messages</NavLink></li>
                <li className='py-2'><a href="">Users</a></li>
                <li className='py-2'><a href="">Tickets</a></li>
                <li className='py-2'><a href="">Notices</a></li>
                <li>
                    <Form action="/logout" method="post">
                        <button>Logout</button>
                    </Form>
                </li>
            </ul>
        </aside>
    )
}