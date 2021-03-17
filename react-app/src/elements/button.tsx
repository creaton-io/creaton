import {ButtonHTMLAttributes, FC} from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    label: string;
    theme?: 'primary' | 'secondary' | 'secondary-2',
}

const primaryStyle = [
    "bg-blue-primary text-white",
    "hover:bg-blue",
    "active:bg-blue-dark",
    "focus:outline-none focus:bg-blue focus:ring-1 focus:ring-blue focus:ring-offset-2",
    "disabled:bg-grey disabled:text-grey-dark",
]

const secondaryStyle = [
    "bg-white text-blue-primary border border-light",
    "hover:border-blue-primary",
    "active:border-line",
    "focus:outline-none focus:bg-blue-light focus:border-blue-primary focus:ring-4 focus:ring-blue-light",
    "disabled:bg-grey disabled:text-grey-dark disabled:border-transparent",
]

const secondary2Style = [
    "bg-blue-light text-blue-primary border border-transparent",
    "hover:bg-blue-light-150",
    "active:bg-blue-light-200",
    "focus:outline-none focus:bg-blue-light focus:ring-4 focus:ring-blue-light focus:border-blue-primary",
    "disabled:bg-grey disabled:text-grey-dark disabled:border-transparent",
]

export const Button: FC<ButtonProps> = ({ theme= 'primary', className, label, ...props }) => {
    let classes = primaryStyle;

    switch (theme) {
        case "secondary":
            classes = secondaryStyle;
            break;
        case "secondary-2":
            classes = secondary2Style;
            break;
    }

    return (
        <button
            type="button"
            className={clsx(
                "inline-flex items-center px-8 py-4",
                "font-medium rounded-full leading-4",
                ...classes,
                className
            )}
            {...props}
        >
            {label}
        </button>
    )
};
