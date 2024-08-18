import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Hr from "../HorizontalLine";

const Model: React.FC<{
  open: boolean;
  children: React.ReactNode;
  onSuccess: () => void;
  handleCancel: () => void;
  title: string;
  cancelBtnText?: string;
  successBtnText?: string;
}> = ({
  children,
  onSuccess,
  handleCancel,
  open = false,
  title = "Modal",
  cancelBtnText = "Cancel",
  successBtnText = "Submit",
}) => {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [open]);

  const modalRoot = document.getElementById("root-model") as HTMLElement;
  return createPortal(
    open && (
      <dialog ref={dialog} className="animate-scale">
        <div className="px-10 pt-5 sticky top-0 bg-white">
          <h2 className="text-xl">{title}</h2>
        </div>
        <Hr />

        <div className="max-h-[80vh] overflow-hidden">
          <div className="px-10 py-8 max-h-[420px] overflow-y-auto scrollbar-thin">
            {children}
          </div>
          <Hr />
          <div className="flex justify-end gap-4 py-6 pr-6 sticky bottom-0 bg-white">
            <button onClick={handleCancel}>{cancelBtnText}</button>
            <button type="button" onClick={onSuccess}>
              {successBtnText}
            </button>
          </div>
        </div>
      </dialog>
    ),
    modalRoot
  );
};

export default Model;
