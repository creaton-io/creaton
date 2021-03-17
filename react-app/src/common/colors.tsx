import {FC} from "react";
import { startCase, kebabCase } from 'lodash';
import clsx from "clsx";

export interface ColorProps {
    name: string;
    value: string;
}

interface ColorsPalletProps {
    colors: ColorProps[];
}

export const ColorsPallet: FC<ColorsPalletProps> = ({ colors }) => (
    <div className="flex flex-wrap">
        {colors.map(color => (
            <div className="mx-4 flex w-1/5 my-4">
                <div className={clsx("w-24 h-24 rounded-2xl", `bg-${kebabCase(color.name)}`, { 'border border-gray-20': color.name === 'white' })}>
                </div>
                <div className="ml-4 font-semibold flex flex-col justify-center flex-1">
                    <h4>{startCase(color.name)}</h4>
                    <span className="text-gray-500 text-sm font-light">{color.value}</span>
                </div>
            </div>
        ))}
        <div className="mx-4 flex w-1/5 my-4">
            <div className={clsx("w-24 h-24 rounded-2xl border")}>
            </div>
            <div className="ml-4 font-semibold flex flex-col justify-center flex-1">
                <h4>Border Light</h4>
                <span className="text-gray-500 text-sm font-light">#E2E4E4</span>
            </div>
        </div>
        <div className="mx-4 flex w-1/5 my-4">
            <div className={clsx("w-24 h-24 rounded-2xl border-8 border-hard")}>
            </div>
            <div className="ml-4 font-semibold flex flex-col justify-center flex-1">
                <h4>Border Hard</h4>
                <span className="text-gray-500 text-sm font-light">#ECECF0</span>
            </div>
        </div>
        <div className="mx-4 flex w-1/5 my-4">
            <div className={clsx("w-24 h-24 rounded-2xl border-3/2 border-line")}>
            </div>
            <div className="ml-4 font-semibold flex flex-col justify-center flex-1">
                <h4>Border Line</h4>
                <span className="text-gray-500 text-sm font-light">#9A98A2</span>
            </div>
        </div>
        <div className="mx-4 flex w-1/5 my-4">
            <div className={clsx("w-24 h-24 rounded-2xl border-3/2 border-search")}>
            </div>
            <div className="ml-4 font-semibold flex flex-col justify-center flex-1">
                <h4>Search Line</h4>
                <span className="text-gray-500 text-sm font-light">#2A64F6</span>
            </div>
        </div>
    </div>
);
