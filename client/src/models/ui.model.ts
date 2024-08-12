export interface IMenuItem {
  label: string;
  onClick: <T>(label: string, data?: T) => void;
  icon?: React.ReactNode; // Optional: icon for the menu item
  subItems?: IMenuItem[]; // Optional: nested sub-menu items
}

// Define a type for the menu component props
export interface IPopupMenuProps<T = unknown> {
  items: IMenuItem[];
  data?: T;
}

export interface ImageWithFallbackProps {
  src: string;
  alt: string;
  defaultSrc: string;
  className?: string;
}

export interface FileInputProps {
  onFileChange: (files: FileList | null) => void;
  id: string;
  icon: React.ReactNode;
}
