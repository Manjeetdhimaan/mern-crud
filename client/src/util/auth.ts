import { redirect } from 'react-router-dom';
import { EXPIRATION, TOKEN as localToken, USER_EMAIL, USER_ID } from '../constants/local.constants';

export function getTokenDuration(): number {
  const storedExpirationDate = localStorage.getItem(EXPIRATION) || 0;
  const expirationDate = new Date(storedExpirationDate);
  const now = new Date();
  const duration = expirationDate.getTime() - now.getTime();
  return duration;
}

export function getAuthToken(): string | null {
  const token = localStorage.getItem(localToken);
  if (!token || token === 'undefined') {
    return null;
  }

  const tokenDuration = getTokenDuration();

  if (tokenDuration < 0) {
    return 'EXPIRED';
  }

  return token;
}


export function getUserEmail(): string | null {
  const email = localStorage.getItem(USER_EMAIL);
  if (!email || email === 'undefined') {
    return null;
  }

  return email;
}

export function tokenLoader(): string | Response {
  const token = getAuthToken();
               
  if(!token) {
    return redirect('/login');
  }
  return token;
}

export function getUserId(): string | null {
    const id = localStorage.getItem(USER_ID);
    if (!id || id === 'undefined') {
      return null;
    }
    return id;
  }

export function checkAuthLoader(): Response | undefined {
  const token = getAuthToken();

  if (!token) {
    return redirect('/auth');
  }
}