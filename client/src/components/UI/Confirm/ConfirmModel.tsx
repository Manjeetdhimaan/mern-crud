import { useEffect, useState } from "react";

import Model from "../PopupModel/PopupModel";

const ConfirmModel: React.FC<{
    open: boolean,
    confirmCallback: <T>(data?: T) => void,
    cancelCallback: <T>(data?: T) => void,
    title?: string,
    description?: string | React.ReactNode,
    confirmBtnText?: string
}> = ({ open, confirmCallback, cancelCallback, title, description, confirmBtnText }) => {

    const [isModelOpen, setIsModelOpen] = useState(false);

    useEffect(() => {
        setIsModelOpen(open);
    }, [open])

    const handleConfirm = () => {
        confirmCallback();
    }

    const handleCancel = () => {
        cancelCallback();
    }

    return (
        <Model
            open={isModelOpen}
            onSuccess={handleConfirm}
            handleCancel={handleCancel}
            title={title || "Sure to delete"}
            successBtnText={confirmBtnText || "Delete"}
        >

            <div>
                {description || "Are you sure you want to delete"}
            </div>

        </Model>
    );
};

export default ConfirmModel;


