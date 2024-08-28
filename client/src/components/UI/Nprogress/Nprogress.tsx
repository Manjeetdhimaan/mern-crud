import React, { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const HttpProgressBar: React.FC = () => {

  useEffect(() => {
    NProgress.configure({ showSpinner: false, speed: 500 });

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    // Start the progress bar before a request starts
    window.addEventListener('httpRequestStart', handleStart);

    // Stop the progress bar after a request ends
    window.addEventListener('httpRequestEnd', handleStop);

    return () => {
      window.removeEventListener('httpRequestStart', handleStart);
      window.removeEventListener('httpRequestEnd', handleStop);
    };
  }, []);

  return null; // No UI element is rendered
};

export default HttpProgressBar;
