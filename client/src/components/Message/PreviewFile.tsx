import Image from "../UI/Image/Image";
import { DocumentIcon } from "../UI/Icons/Icons";
import { IFileBase64 } from "../../models/message.model";
import { imageExtensions, nonViewableExtensions } from "../../constants/files.constants";

const PreviewFile: React.FC<{
    classes: string;
    fileUrl: string;
    file?: IFileBase64;
    fileExtenstion?: string,
    showDownloadLink?: boolean
}> = ({ classes, fileUrl, file, fileExtenstion, showDownloadLink = false }) => {
    const localFile = file as IFileBase64;
    const fileName = localFile?.name;
    let downloadLink = null;
    if (showDownloadLink) {
        downloadLink = <DownloadLink fileUrl={fileUrl} fileName={fileName} />;
    }

    if (nonViewableExtensions.includes(localFile?.extenstion) || nonViewableExtensions.includes(fileExtenstion as string)) {
        const size = localFile?.size ? Math.ceil(Number(localFile?.size) / 1024) : 0;
        return (
            <>
                <div className={classes + " text-center grid content-center"}>
                    <div className="flex justify-center">
                        <DocumentIcon className="size-10" />
                    </div>
                    <h2>No preview available</h2>

                    <div>
                        <small>
                            {fileName}  {size > 0 && " - " + size + `${size >= 1024 ? "MB" : "KB"}`}
                        </small>
                    </div>
                </div>
                {downloadLink}
            </>
        );
    } else if (fileUrl.includes("image/") || imageExtensions.includes(fileExtenstion as string)) {
        return (
            <div>
                <Image className={classes} src={fileUrl} alt="file selcetd" />
                {downloadLink}
            </div>
        );
    } else if (fileUrl.includes("video/")) {
        return (
            <div>
                <video src={fileUrl} controls autoPlay className={classes}></video>
                {downloadLink}
            </div>
        )
    } else {
        return (
            <div className={classes}>
                <iframe height="100%" width="100%" src={fileUrl}></iframe>
                <div className="mt-1">
                    {downloadLink}
                </div>
            </div>
        );
    }
};

export default PreviewFile;

const DownloadLink: React.FC<{ fileUrl: string, fileName: string }> = ({ fileUrl, fileName }) => {
    return (
        <div className="text-center">
            <small>
                <a href="#" onClick={async () => await downloadFile(fileUrl, fileName)} className="hover:underline">
                    Download
                </a>
            </small>
        </div>
    )
}

export const downloadFile = async (fileUrl: string, fileName: string) => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || fileUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
};