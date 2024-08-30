import { useEffect, useState } from 'react';
import { Outlet, redirect, useLoaderData, useSubmit } from 'react-router-dom';

import SideBar from '../SideBar/SideBar';
import { MenuIcon } from '../UI/Icons/Icons';
import { getTokenDuration } from '../../util/auth';
import Backdrop from '../UI/Backdrop/Backdrop';

function RootLayout() {
    const token = useLoaderData();
    const submit = useSubmit();
    const [sideBarIsOpen, setSideBarIsOpen] = useState<boolean>(false);
    // const navigation = useNavigation();

    useEffect(() => {
        if (!token) {
            redirect('/login');
            return;
        }


        if (token === 'EXPIRED') {
            submit(null, { action: '/logout', method: 'post' });
            return;
        }

        const tokenDuration = getTokenDuration();

        setTimeout(() => {
            submit(null, { action: '/logout', method: 'post' });
        }, tokenDuration);
    }, [token, submit]);

    const toggleSideBar = (): void => {
        setSideBarIsOpen(prev => !prev);
    }

    return (
        <>
            {
                sideBarIsOpen &&
                <div className='lg:hidden'>
                    <Backdrop onClick={toggleSideBar} />
                </div>
            }

            <header className="bg-stone-700 w-screen p-6 text-center relative">
                <a className='lg:hidden absolute top-7 left-7 z-10' onClick={toggleSideBar}>
                    <MenuIcon />
                </a>
                <h2 className="text-xl text-cyan-50"> Main Header</h2>
            </header>
            <SideBar onNavigate={toggleSideBar} sideBarIsOpen={sideBarIsOpen} />
            <main className='fixed top-[76px] left-0 lg:left-[20%] w-[100%]'>
                {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
                <Outlet />
            </main>
        </>
    )

}

export default RootLayout;