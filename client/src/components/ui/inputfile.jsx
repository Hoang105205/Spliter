import * as React from "react";
import { Upload } from "lucide-react"; // optional icon
import { cn } from "../../lib/utils";

const InputFile = React.forwardRef(
  ({ className, onChange, label = "Upload Image", id = "input-file", ...props }, ref) => {
    return (
      <div className="flex flex-col items-center gap-2">
        <label
          htmlFor={id}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-white text-[23px] font-normal cursor-pointer",
            "rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0]",
            "transition-colors duration-200 border border-transparent hover:border-white",
            "button-blue-data", // custom class if needed
            className
          )}
        >
          <Upload className="w-5 h-5" />
          {label}
        </label>

        <input
          ref={ref}
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
          {...props}
        />
      </div>
    );
  }
);

InputFile.displayName = "InputFile";

export default InputFile;