import {FC, TextareaHTMLAttributes} from "react";
import clsx from "clsx";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>{
    className?: string;
    invalid?: boolean;
    label?: string;
}

const classes = [
    "px-6 py-5 w-80 rounded-xl text-grey-dark outline-none border-2 text-semibold",
    "active:border-blue-dark active:ring-4 active:ring-blue-light",
    "focus:border-blue-dark focus:ring-4 focus:ring-blue-light",
    "disabled:bg-grey disabled:border-grey"
];

export const Textarea: FC<TextAreaProps> = ({ className, invalid = false, label, ...attributes }) => {
    return (
        <div className="mb-4">
            <div className="flex items-center mb-1">
                {label !== "" ? 
                    <label className="block font-semibold mb-1">{label}</label>
                    :
                    <p>No Label</p>
                }
            </div>
            <textarea className={clsx(
                classes,
                className,
                { "border-pink ring-4 ring-pink-light": invalid })
            } {...attributes} />
        </div>
    )
}
