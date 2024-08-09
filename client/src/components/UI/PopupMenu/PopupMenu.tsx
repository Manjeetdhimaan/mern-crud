import React, { useState, useRef, useCallback, useEffect } from "react";

import "./PopupMenu.css";
import { ArrowDownIcon } from "../Icons/Icons";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { IMenuItem, IPopupMenuProps } from "../../../models/ui.model";

// Custom hook to detect clicks outside the component

const PopupMenu: React.FC<IPopupMenuProps> = ({ items, data }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useOutsideClick(menuRef, () => setIsOpen(false));

  useEffect(() => {
    const updateMenuPosition = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Check if there is enough space below the button to display the menu
        if (spaceBelow < 150 && spaceAbove > 150) {
          // Assuming the menu height is around 150px
          setMenuPosition("top");
        } else {
          setMenuPosition("bottom");
        }
      }
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [isOpen]);

  const handleItemClick = (
    label: string,
    onClick: <T>(label: string, data?: T) => void
  ) => {
    onClick(label, data);
    setIsOpen(false); // Close menu after clicking an item
  };

  const renderMenuItems = (items: IMenuItem[]) => {
    return items.map((item, index) => (
      <li
        key={index}
        onClick={() => handleItemClick(item.label, item.onClick)}
        className="menu-item"
      >
        {item.icon && <span className="menu-item-icon">{item.icon}</span>}
        <span>{item.label}</span>
        {item.subItems && (
          <ul className="submenu">{renderMenuItems(item.subItems)}</ul>
        )}
      </li>
    ));
  };

  return (
    <div className="menu-container">
      <button
        className="menu-button cursor-pointer bg-transparent outline-none p-0"
        onClick={toggleMenu}
        ref={buttonRef}
      >
        <ArrowDownIcon />
      </button>
      {isOpen && (
        <div className={`menu menu-${menuPosition}`} ref={menuRef}>
          <ul>{renderMenuItems(items)}</ul>
        </div>
      )}
    </div>
  );
};

export default PopupMenu;
