import { useSelector } from "react-redux";

import Model from "../UI/PopupModel/PopupModel";
import Image from "../UI/Image/Image";
import { RootState } from "../../store";
import { DocumentIcon } from "../UI/Icons/Icons";
import { IFileBase64 } from "../../models/message.model";
import { imageExtensions, nonViewableExtensions } from "../../constants/files.constants";

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
          className={`grid gap-8 ${
            filesBase64.length === 2 
              ? "md:grid-cols-2"
              : filesBase64.length >= 3 
              ? "md:grid-cols-3" 
              : "md:grid-cols-1"
          }`}
          >
            {filesBase64.map((file) => {
              const fileUrl = file.url;
              const key = fileUrl + Math.random() * 1000 + new Date().getDate();
              const classes = `${
                (filesBase64.length >= 2) ? "size-[20rem]" : "size-[28rem]"
              } border border-solid p-2 scrollbar-none`;

              return (
                <PreviewFiles
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

export const PreviewFiles: React.FC<{
  classes: string;
  fileUrl: string;
  file?: IFileBase64;
  fileExtenstion?: string
}> = ({ classes, fileUrl, file, fileExtenstion }) => {
  const localFile = file as IFileBase64;
  const fileName = localFile?.name;

  if (nonViewableExtensions.includes(localFile?.extenstion) || nonViewableExtensions.includes(fileExtenstion as string)) {
    const size = localFile?.size ? Math.ceil(Number(localFile?.size) / 1024) : 0;
    return (
      <div className={classes + " text-center grid content-center"}>
        <div className="flex justify-center">
          <DocumentIcon className="size-10" />
        </div>
        <h2>No preview available</h2>
        <div>
          <small>
            {fileName}  {size > 0 &&  " - "+  size + `${size >= 1024 ? "MB" : "KB"}`}
          </small>
        </div>
      </div>
    );
  } else if (fileUrl.includes("image/") || imageExtensions.includes(fileExtenstion as string)) {
    return (
      <div>
        <Image className={classes} src={fileUrl} alt="file selcetd" />
      </div>
    );
  } else if (fileUrl.includes("video/")) {
    return <video src={fileUrl} controls autoPlay className={classes}></video>
  } else {
    return (
      <div className={classes}>
        <iframe height="100%" width="100%" src={fileUrl}></iframe>
      </div>
    );
  }
};
