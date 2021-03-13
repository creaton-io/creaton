import {FC} from "react";
import { startCase, kebabCase } from 'lodash';
import clsx from "clsx";

interface ButtonProps {
    className?: string;
    label: string;
}

export const Button: FC<ButtonProps> = ({ className, label }) => (
    <button
        type="button"
        className={clsx("inline-flex items-center px-8 py-4 shadow-sm font-medium rounded-full text-white bg-blue-primary hover:bg-blue active:bg-blue-dark focus:outline-none focus:bg-blue-light leading-4", className)}>
        {label}
    </button>
);
