import { useEffect } from 'react';
import { Outlet, redirect, useLoaderData, useSubmit } from 'react-router-dom';

import SideBar from '../SideBar/SideBar';
import { getTokenDuration } from '../../util/auth';

function RootLayout() {
    const token = useLoaderData();
    const submit = useSubmit();
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

    return (
        <>
            <SideBar />

            <main className='fixed top-0 left-[20%]'>
                {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
                <Outlet />
            </main>
        </>
    )

}

export default RootLayout;