import { useSelector } from "react-redux";

import PreviewFile from "./PreviewFile";
import Model from "../UI/PopupModel/PopupModel";
import { RootState } from "../../store";

const FileShareInMessage: React.FC<{
  handleCancelFileSharing: () => void;
  handleFileSharing: () => void;
}> = ({ handleCancelFileSharing, handleFileSharing }) => {
  const filesBase64 = useSelector(
    (state: RootState) => state.message.filesBase64
  );
  const modelIsOpen = useSelector(
    (state: RootState) => state.message.modelIsOpen
  );

  return (
    <Model
      open={modelIsOpen}
      onSuccess={handleFileSharing}
      handleCancel={handleCancelFileSharing}
      title="Share Files"
      successBtnText="Send"
    >

      {filesBase64 && filesBase64.length > 0 && (
        <div
          className={`grid gap-8 ${filesBase64.length === 2
            ? "md:grid-cols-2"
            : filesBase64.length >= 3
              ? "md:grid-cols-3"
              : "md:grid-cols-1"
            }`}
        >
          {filesBase64.map((file) => {
            const fileUrl = file.url;
            const key = fileUrl + Math.random() * 1000 + new Date().getDate();
            const classes = `${(filesBase64.length >= 2) ? "size-[20rem]" : "size-[28rem]"
              } border border-solid p-2 scrollbar-none`;

            return (
              <PreviewFile
                classes={classes}
                key={key}
                fileUrl={fileUrl}
                file={file}
              />
            )
          })}
        </div>
      )}
    </Model>
  );
};

export default FileShareInMessage;


