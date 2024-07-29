import {
    Form,
    // json,
    Link,
    redirect,
    useActionData,
    useNavigation,
} from 'react-router-dom';
import { userEmail, userId, token as localToken, expiration as localExpiration } from '../../constants/local.constants';

// interface actionData { errors: { [key: string]: string }, message: string };

function Login() {
    const data: any = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';
    const inputClasses = 'border-b-2 border-y-cyan-950 outline-none my-4';

    return (
        <section className='flex justify-center h-screen items-center'>
            <Form method="post">
                <h2 className='text-4xl mb-8'>Log in</h2>
                {/* {data && (data as actionData).errors && (
                    <ul>
                        {Object.values((data as actionData).errors).map((err) => (
                            <li className='text-red-600' key={err}>{err}</li>
                        ))}
                    </ul>
                )} */}
                {data && data.message && <p  className='text-red-600'>{data.message}</p>}
                <p>
                    {/* <label htmlFor="fullName">FullName</label> */}
                </p>
                <p>
                    {/* <label htmlFor="email">Email</label> */}
                    <input className={inputClasses} placeholder='Email' id="email" type="email" name="email" required />
                </p>
                <p>
                    {/* <label htmlFor="id">Password</label> */}
                    <input className={inputClasses} placeholder='Password' id="password" type="password" name="password" required />
                </p>
                <div >

                    <button className='' disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                    <Link to='/sign-up'>
                        Create new account
                    </Link>
                </div>
            </Form>
        </ section>
    );
}

export default Login;

export async function action({ request }: any) {

    const data = await request.formData();
    const authData = {
        email: data.get('email'),
        password: data.get('password'),
    };
    // manjeetdhimaan60@gmail.com

    const response = await fetch('http://localhost:4002/api/v1/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData)
    });

    if (response.status === 422 || response.status === 401) {
        return response;
    }

    if (!response.ok) {
        return response;
        //   throw json({ message: 'Could not authenticate user.' }, { status: 500 });
        //   throw new Response(JSON.stringify({ message: 'Could not authenticate user.' }), {
        //     status: 500,
        //   });
    }

    const resData = await response.json();
    const token = resData.data.token;
    const userPayload = JSON.parse(atob(token.split('.')[1]));

    localStorage.setItem(localToken, token);
    localStorage.setItem(userId, userPayload._id);
    localStorage.setItem(userEmail, userPayload._email);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    localStorage.setItem(localExpiration, expiration.toISOString());
    return redirect('/');
}