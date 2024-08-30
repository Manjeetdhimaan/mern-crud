const Backdrop:React.FC<{onClick: () => void}> = ({onClick}) => {
    return (
        <div onClick={onClick} className="fixed z-[1] inset-0 backdrop-blur-sm"></div>
    )
}

export default Backdrop;