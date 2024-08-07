import { redirect } from 'react-router-dom';
import { EXPIRATION, TOKEN, USER_ID, USER_EMAIL } from '../../constants/local.constants';

export function action() {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(EXPIRATION);
    localStorage.removeItem(USER_EMAIL);
    localStorage.removeItem(USER_ID);
    return redirect('/');
}