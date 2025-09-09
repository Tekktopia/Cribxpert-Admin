import { useState, useEffect } from "react";

interface SvgIconProps {
  src: string; // Path to SVG file in public folder (e.g., "/icons/exit.svg")
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  fallback?: React.ReactNode; // Fallback content if SVG fails to load
}

export function SvgIcon({
  src,
  className = "",
  width = 24,
  height = 24,
  alt = "Icon",
  fallback = null,
}: SvgIconProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Fetch the SVG file from the public folder
        const response = await fetch(src);

        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.status}`);
        }

        const svgText = await response.text();
        console.log("SVG loaded successfully:", src);
        setSvgContent(svgText);
      } catch (error) {
        console.error("Error loading SVG:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (src) {
      loadSvg();
    }
  }, [src]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-100 border border-gray-300 rounded flex items-center justify-center  ${className}`}
        style={{
          width,
          height,
          display: "inline-block",
          lineHeight: 0,
        }}
        aria-label='Loading icon'
      />
    );
  }

  // Error state - show fallback or placeholder
  if (hasError || !svgContent) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={`bg-gray-100 border border-gray-300 rounded flex items-center justify-center ${className}`}
        style={{ width, height }}
        aria-label={alt}
      >
        <span className='text-gray-400 text-xs'>?</span>
      </div>
    );
  }

  // Parse and modify the SVG content
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.querySelector("svg");

  if (svgElement) {
    // Set width and height
    svgElement.setAttribute("width", width.toString());
    svgElement.setAttribute("height", height.toString());

    // Add className if provided
    if (className) {
      svgElement.setAttribute("class", className);
    }

    // Serialize back to string
    const serializer = new XMLSerializer();
    const modifiedSvg = serializer.serializeToString(svgElement);

    return (
      <div
        dangerouslySetInnerHTML={{ __html: modifiedSvg }}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: "inline-block",
          lineHeight: 0,
        }}
        aria-label={alt}
      />
    );
  }

  // Fallback if parsing fails
  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: "inline-block",
        lineHeight: 0,
      }}
      aria-label={alt}
    />
  );
}

// Preset icon sizes for convenience
export const IconSizes = {
  xs: { width: 16, height: 16 },
  sm: { width: 20, height: 20 },
  md: { width: 24, height: 24 },
  lg: { width: 32, height: 32 },
  xl: { width: 40, height: 40 },
  "2xl": { width: 48, height: 48 },
  "3xl": { width: 64, height: 64 },
} as const;

// Convenience wrapper for common icon sizes
interface QuickSvgIconProps extends Omit<SvgIconProps, "width" | "height"> {
  size?: keyof typeof IconSizes;
}

export function QuickSvgIcon({ size = "md", ...props }: QuickSvgIconProps) {
  const { width, height } = IconSizes[size];
  return <SvgIcon {...props} width={width} height={height} />;
}
