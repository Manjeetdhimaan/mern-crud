import { redirect } from 'react-router-dom';
import { token as localToken, userId } from '../constants/local.constants';

export function getTokenDuration() {
  const storedExpirationDate = localStorage.getItem('expiration') || 0;
  const expirationDate = new Date(storedExpirationDate);
  const now = new Date();
  const duration = expirationDate.getTime() - now.getTime();
  return duration;
}

export function getAuthToken() {
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

export function tokenLoader() {
  const token = getAuthToken();
               
  if(!token) {
    return redirect('/login');
  }
  return token;
}

export function idLoader() {
    const id = localStorage.getItem(userId);
    return id;
  }

export function checkAuthLoader() {
  const token = getAuthToken();

  if (!token) {
    return redirect('/auth');
  }
}