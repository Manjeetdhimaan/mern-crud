import { useEffect } from "react";

export function useOutsideClick(ref: React.RefObject<HTMLDivElement>, btnRef: React.RefObject<HTMLButtonElement>, handler: () => void): void {
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node) && btnRef.current && !btnRef.current.contains(event.target as Node)) {
            handler();
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref, handler]);
  }