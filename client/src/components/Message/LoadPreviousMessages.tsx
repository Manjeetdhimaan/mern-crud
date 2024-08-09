import { IMessage } from "../../models/message.model";

const LoadPreviousMessages: React.FC<{
  messages: IMessage[];
  totalCount: number;
  disableLoadPreviosMsg: boolean;
  onLoadPreviousMsgs: () => void;
}> = ({ messages, totalCount, onLoadPreviousMsgs, disableLoadPreviosMsg }) => {
  return (
    <>
      {messages.length > 0 && (
        <>
          {totalCount > messages.length ? (
            <p className="text-center cursor-pointer">
              <button
                disabled={disableLoadPreviosMsg}
                className={`border-none p-0 bg-transparent text-blue-600`}
                onClick={onLoadPreviousMsgs}
              >
               {disableLoadPreviosMsg ? 'Loading previous messages...' : 'Load previous messages'} 
              </button>
            </p>
          ) : (
            <p className="text-center">
              Conversation started on{" "}
              {new Date(messages[0].createdAt).getDate() +
                "-" +
                (new Date(messages[0].createdAt).getMonth() + 1) +
                "-" +
                new Date(messages[0].createdAt).getFullYear()}
            </p>
          )}
        </>
      )}
    </>
  );
};

export default LoadPreviousMessages;
