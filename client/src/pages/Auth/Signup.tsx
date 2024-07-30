import {
    Form,
    Link,
    redirect,
    useActionData,
    useNavigation,
} from 'react-router-dom';


function Signup() {
    const data: any = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';
    const inputClasses = 'border-b-2 border-y-cyan-950 outline-none my-4 w-[100%]';

    return (
        <section className='flex justify-center h-screen items-center'>
            <Form method="post" className='w-[30%]'>
                <h2 className='text-4xl mb-8'>Sign up</h2>
                {data && data.message && <p className='text-red-600'>{data.message}</p>}
                <p>
                    <input className={inputClasses} placeholder='Full Name' id="fullName" type="text" name="fullName" required />
                </p>
                <p>
                    <input className={inputClasses} placeholder='Email' id="email" type="email" name="email" required />
                </p>
                <p>
                    <input className={inputClasses} placeholder='Password' id="password" type="password" name="password" required />
                </p>
                <div className='flex items-center justify-between'>

                    <button className='' disabled={isSubmitting}>
                        {isSubmitting ? 'Signing up...' : 'Sign up'}
                    </button>
                    <Link to='/'>
                        Login in
                    </Link>
                </div>
            </Form>
        </section>
    );
}

export default Signup;

export async function action({ request }: any) {

    const data = await request.formData();
    const authData = {
        email: data.get('email'),
        password: data.get('password'),
        fullName: data.get('fullName')
    };
    // manjeetdhimaan60@gmail.com

    const response = await fetch('http://localhost:4002/api/v1/users/sign-up', {
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
    }

    await response.json();
    return redirect('/');
}