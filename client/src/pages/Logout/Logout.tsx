import { redirect } from 'react-router-dom';
import { expiration, token, userEmail, userId } from '../../constants/local.constants';

export function action() {
    localStorage.removeItem(token);
    localStorage.removeItem(expiration);
    localStorage.removeItem(userEmail);
    localStorage.removeItem(userId);
    return redirect('/');
}