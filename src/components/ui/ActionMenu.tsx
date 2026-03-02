import React, { useState, useRef, useEffect } from "react";

interface DropdownMenuItem {
  label: string;
  action: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}

interface ActionMenuProps {
  items: DropdownMenuItem[];
  onSelect: (action: string) => void;
  trigger: React.ReactNode;
  className?: string;
}

export function ActionMenu({
  items,
  onSelect,
  trigger,
  className = "",
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const menuWidth = 192; // w-48 = 12rem ≈ 192px
        const top = rect.bottom + 8; // small offset below trigger
        const left = rect.right - menuWidth;
        setMenuPosition({ top, left });
      }
      return next;
    });
  };

  const handleItemClick = (action: string) => {
    onSelect(action);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      <div onClick={toggleMenu}>{trigger}</div>

      {isOpen && menuPosition && (
        <div
          className='fixed z-50 w-48 rounded-md bg-white py-1 shadow-lg focus:outline-none'
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.action)}
              className={`
                flex w-full items-center px-4 py-2 text-sm text-left hover:cursor-pointer hover:bg-gray-50 transition-colors
                ${
                  item.variant === "destructive"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700"
                }
              `}
            >
              {item.icon && (
                <span className='mr-3 flex-shrink-0'>{item.icon}</span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Export types for reuse
export type { DropdownMenuItem, ActionMenuProps };
