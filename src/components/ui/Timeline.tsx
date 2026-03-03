// 1. Define the shape of a single step
interface TimelineStep {
  label: string;
  time: string;
  isCompleted: boolean;
}

// 2. Define the props for the component
interface TimelineProps {
  steps?: TimelineStep[];
}

export function Timeline({ steps = [] }: TimelineProps) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="relative flex gap-4">
          {/* Vertical Line */}
          {index !== steps.length - 1 && (
            <div className="absolute left-[7px] top-5 w-[1.5px] h-[calc(100%+8px)] bg-gray-100" />
          )}

          {/* Dot: Pixel-Perfect matching the teal brand color */}
          <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0 mt-1 ${
            step.isCompleted ? 'bg-[#0D9488]' : 'bg-gray-300'
          }`} />

          {/* Text: Optimized typography weights */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-[#111827] leading-none">
              {step.label}
            </p>
            <p className="text-[11px] font-medium text-gray-500">
              {step.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}