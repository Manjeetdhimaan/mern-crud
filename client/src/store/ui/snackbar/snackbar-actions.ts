// snackbarService.ts
import store from '../../index'; // Import your Redux store
import { showSnackbar } from './snackbar-slice';

const snackbarService = {
  success(message: string, duration?: number) {
    store.dispatch(showSnackbar({ message, type: 'success', duration }));
  },
  info(message: string, duration?: number) {
    store.dispatch(showSnackbar({ message, type: 'info', duration }));
  },
  warning(message: string, duration?: number) {
    store.dispatch(showSnackbar({ message, type: 'warning', duration }));
  },
  error(message: string, duration?: number) {
    store.dispatch(showSnackbar({ message, type: 'error', duration }));
  },
};

export default snackbarService;
