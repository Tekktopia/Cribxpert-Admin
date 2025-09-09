import type { ReactNode } from "react";

export interface InfoField {
  label: string;
  value: string | ReactNode;
  type?: "text" | "badge" | "custom";
}

interface InfoSectionProps {
  title: string;
  fields: InfoField[];
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  fieldClassName?: string;
  variant?: "default" | "gray" | "bordered";
}

export function InfoSection({
  title,
  fields,
  className = "",
  headerClassName = "",
  contentClassName = "",
  fieldClassName = "",
  variant = "default",
}: InfoSectionProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "gray":
        return {
          container: "bg-gray-50 rounded-lg",
          header: "text-sm font-medium text-gray-900 mb-4 px-4 pt-4",
          content: "space-y-3 px-4 pb-4",
        };
      case "bordered":
        return {
          container: "border border-[#EBEBEB] rounded-b-lg",
          header: "text-lg font-semibold py-3 px-4 bg-[#E6EFF1] mb-2",
          content: "space-y-2 px-6 pb-6",
        };
      default:
        return {
          container: "bg-white rounded-lg",
          header: "text-lg font-semibold mb-4",
          content: "space-y-3",
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className={`${variantClasses.container} ${className}`}>
      <h3 className={`${variantClasses.header} ${headerClassName}`}>{title}</h3>

      <div className={`${variantClasses.content} ${contentClassName}`}>
        {fields.map((field, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 py-2 ${fieldClassName}`}
          >
            <span className='text-sm text-gray-600 min-w-0 flex-shrink-0'>
              {field.label}:
            </span>
            <div className='flex items-center space-x-2 min-w-0 flex-1'>
              {typeof field.value === "string" ? (
                <span className='text-sm text-gray-900 font-medium'>
                  {field.value}
                </span>
              ) : (
                field.value
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
