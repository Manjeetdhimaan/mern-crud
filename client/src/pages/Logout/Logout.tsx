import { redirect } from 'react-router-dom';
import { EXPIRATION, TOKEN, USER_ID, USER_EMAIL } from '../../constants/local.constants';

export function action(): Response {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER_ID);
    localStorage.removeItem(EXPIRATION);
    localStorage.removeItem(USER_EMAIL);
    return redirect('/');
}