
// Snackbar.tsx
import React, { useEffect } from 'react';
import classes from './Snackbar.module.css';
import { CrossIcon } from '../Icons/Icons';
import { ISnackbarProps } from '../../../models/ui.model';

const Snackbar: React.FC<ISnackbarProps> = ({ message, type, duration = 5000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`${classes.snackbar} ${classes[`snackbar-${type}`]} flex`}>
            {message}
            <a title="Dismiss" className="ml-3 text-white" onClick={onClose}><CrossIcon /></a>
        </div>
    );
};

export default Snackbar;
