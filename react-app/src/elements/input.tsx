import {FC, InputHTMLAttributes} from "react";
import clsx from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    className?: string;
    invalid?: boolean;
}

const classes = [
    "px-6 py-5 h-14 w-80 rounded-xl text-grey-dark outline-none border-2 text-semibold",
    "active:border-blue-dark active:ring-4 active:ring-blue-light",
    "focus:border-blue-dark focus:ring-4 focus:ring-blue-light",
    "disabled:bg-grey disabled:border-grey"
];

export const Input: FC<InputProps> = ({ className, invalid = false, type= 'text', ...attributes }) => {

    return (
        <div>
            <input className={clsx(
                classes,
                className,
                { "border-pink ring-4 ring-pink-light": invalid })
            } type={type} {...attributes} />
        </div>
    )
}