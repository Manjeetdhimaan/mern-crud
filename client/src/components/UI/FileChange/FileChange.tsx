import React, { ChangeEvent } from "react";
import { FileInputProps } from "../../../models/ui.model";

const FileInput: React.FC<FileInputProps> = ({
  onFileChange,
  id,
  icon,
}): React.ReactNode => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onFileChange(event.target.files);
  };

  return (
    <label
      htmlFor={id}
      className="cursor-pointer inline-block w-[25px] h-[25px] rotate-[-45deg]"
    >
      <input
        type="file"
        className="hidden"
        id={id}
        onChange={handleFileChange}
      />
      {icon}
    </label>
  );
};

export default FileInput;
