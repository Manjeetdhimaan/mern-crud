import viteImg from '/vite.svg'

export function SideBar() {
    return (
        <aside className="bg-stone-700 w-1/5 h-screen p-6">
            <div className="flex justify-center">
                <img src={viteImg} alt="" />
            </div>
            <ul className="p-8 text-cyan-50 text-left">
                <li className='py-2'><a href="">Messages</a></li>
                <li className='py-2'><a href="">Users</a></li>
                <li className='py-2'><a href="">Tickets</a></li>
                <li className='py-2'><a href="">Notices</a></li>
            </ul>
        </aside>
    )
}