import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import http from "../../services/http/http.service";
import { AxiosError } from "axios";
import {
  USER_EMAIL,
  USER_ID,
  TOKEN as localToken,
  EXPIRATION as localExpiration,
} from "../../constants/local.constants";
import { EyeCloseIcon, EyeIcon } from "../../components/UI/Icons/Icons";

function Login() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const inputClasses =
    "border-b-2 border-y-cyan-950 outline-none my-4 w-[100%]";

  useEffect(() => {
    inputRef.current?.focus();
  }, [])


  async function login(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      setError("");
      setIsSubmitting(true);
      const data = new FormData(e.target as HTMLFormElement);
      const authData = {
        email: data.get("email"),
        password: data.get("password"),
      };
      const response = await http.post("/users/login", authData);

      const token = response.data.token;
      const userPayload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem(localToken, token);
      localStorage.setItem(USER_ID, userPayload._id);
      localStorage.setItem(USER_EMAIL, userPayload._email);
      const expiration = new Date(userPayload.exp * 1000);
      localStorage.setItem(localExpiration, expiration.toISOString());
      return navigate("/");
    } catch (error: unknown) {
      const err = error as AxiosError;
      const errorMsg = (err.response?.data as Error).message;
      if (errorMsg) {
        setError(errorMsg);
      } else {
        setError("An error occured, Please try again");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex justify-center h-screen items-center">
      <form onSubmit={login} className="w-[30%]">
        <h2 className="text-4xl mb-8">Log in</h2>
        {error && <p className="text-red-600">{error}</p>}
        <p>
          <input
            className={inputClasses}
            placeholder="Email"
            id="email"
            type="email"
            name="email"
            required
            ref={inputRef}
          />
        </p>
        <p className="flex relative">
          <input
            className={inputClasses}
            placeholder="Password"
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            required
          />
          {
            <a className="absolute right-2 top-3 text-cyan-950" title={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
            </a>
          }

        </p>
        <div className="flex items-center justify-between">
          <button className="" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          <Link to="/sign-up">Create new account</Link>
        </div>
      </form>
    </section>
  );
}

export default Login;

// export async function action({ request }: any) {

//     const data = await request.formData();
//     const authData = {
//         email: data.get('email'),
//         password: data.get('password'),
//     };
//     // manjeetdhimaan60@gmail.com
//     const response = await http.post('/users/login', authData);

//     if (response.status === 422 || response.status === 401 || response.status === 404) {
//         return response;
//     }

//     const token = response.data.token;
//     const userPayload = JSON.parse(atob(token.split('.')[1]));

//     localStorage.setItem(localToken, token);
//     localStorage.setItem(userId, userPayload._id);
//     localStorage.setItem(userEmail, userPayload._email);
//     const expiration = new Date();
//     expiration.setHours(expiration.getHours() + 1);
//     localStorage.setItem(localExpiration, expiration.toISOString());
//     return redirect('/');
// }
