import {FC, InputHTMLAttributes} from "react";
import clsx from "clsx";
import Tooltip from "./tooltip";
import {Icon} from "../icons";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    className?: string;
    invalid?: boolean;
    label?: string;
    tooltip?: string;
}

const classes = [
    "px-6 py-5 h-14 w-80 rounded-xl text-grey-dark outline-none border-2 text-semibold",
    "active:border-blue-dark active:ring-4 active:ring-blue-light",
    "focus:border-blue-dark focus:ring-4 focus:ring-blue-light",
    "disabled:bg-grey disabled:border-grey"
];

export const Input: FC<InputProps> = ({ className, invalid = false, type= 'text', label, tooltip, ...attributes }) => {
    return (
        <div className="mb-4">
            <div className="flex items-center mb-1">
            {label !== "" 
        ? 
        <label className="block font-semibold mr-1.5">{label}</label>
            :  <p>No Lbael</p>
        }
     {
        tooltip && tooltip.length ? <Tooltip content={<div>{tooltip}</div>} hover>
            <Icon name="question-circle" className="text-gray-500 " />
        </Tooltip> : null
        }

            </div>
    
            <input className={clsx(
                classes,
                className,
                { "border-pink ring-4 ring-pink-light": invalid })
            } type={type} {...attributes} />
        </div>
    )
}
