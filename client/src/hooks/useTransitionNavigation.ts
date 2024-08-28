import { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function useTransitionNavigation() {
    const navigate = useNavigate();

    async function sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        })
    }

    const handleNavigation = async (e: MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        if (location.pathname === href) return;
        const body = document.querySelector('body');
        if (body) {
            body.classList.add('page-transition');
            await sleep(200);
            navigate(href);
            await sleep(200);
            body.classList.remove('page-transition');
        }
    }
    return handleNavigation;
}