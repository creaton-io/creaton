import {ButtonHTMLAttributes, FC} from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    label: string;
    size?: string;
    theme?: 'primary' | 'secondary' | 'secondary-2' | 'focused' | 'unfocused',
}

const primaryStyle = [
    "bg-blue-primary text-white",
    "hover:bg-blue",
    "active:bg-blue-dark",
    "focus:outline-none focus:bg-blue focus:ring-1 focus:ring-blue focus:ring-offset-2",
    "disabled:bg-gray-100 disabled:text-gray-900 disabled:cursor-default",
]

const secondaryStyle = [
    "bg-white text-blue-primary border border-light",
    "hover:border-blue-primary",
    "active:border-line",
    "focus:outline-none focus:bg-blue-light focus:border-blue-primary focus:ring-4 focus:ring-blue-light",
    "disabled:bg-gray-100 disabled:text-gray-900 disabled:border-transparent",
]

const secondary2Style = [
    "bg-blue-light text-blue-primary border border-transparent",
    "hover:bg-blue-light-150",
    "active:bg-blue-light-200",
    "focus:outline-none focus:bg-blue-light focus:ring-4 focus:ring-blue-light focus:border-blue-primary",
    "disabled:bg-gray-100 disabled:text-gray-900 disabled:border-transparent",
]

const focusedStyle = [
  'text-gray-300 hover:bg-gray-700 hover:text-white',
]

const unfocusedStyle = [
  "bg-gray-900 text-white",
]

export const Button: FC<ButtonProps> = ({ theme= 'primary', size= 'full',  className, label, ...props }) => {
    let classes: string[] = [];

    switch (theme) {
        case "secondary":
            classes = secondaryStyle;
            break;
        case "secondary-2":
            classes = secondary2Style;
            break;
        case "focused":
            classes = focusedStyle;
            break;
        case "primary":
            classes = primaryStyle;
            break;
        case "unfocused":
            classes = unfocusedStyle;
            break;
    }



    return (
        <button
            type="button"
            className={clsx(
                "px-3 py-2 rounded-md text-sm font-medium",
                ...classes,
                className,
                { "w-full": size === 'full' }
            )}
            {...props}
        >
            {label}
        </button>
    )
};
