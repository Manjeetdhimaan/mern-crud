import useTransitionNavigation from "../../hooks/useTransitionNavigation"

export default function PageNotFound(): React.ReactNode {

    const navigate = useTransitionNavigation();
    return (
        <div className="grid place-content-center place-items-center h-screen">
            <h1>OOPs...!</h1>
            <h2>Page not found</h2>
            <p>
                <a onClick={(e) => navigate(e, '/')}>Back to home page</a>
            </p>
        </div>
    )
}