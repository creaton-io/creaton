import {FC} from "react";
import { startCase, kebabCase } from 'lodash';
import clsx from "clsx";
import React from "react";

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
                <div className={clsx("w-24 h-24 rounded-2xl", ` bg-${kebabCase(color.name)}`)}>
                </div>
                <div className="ml-4 font-semibold flex flex-col justify-center flex-1">
                    <h4>{startCase(color.name)}</h4>
                    <span className="text-gray-500 text-sm font-light">{color.value}</span>
                </div>
            </div>
        ))}
    </div>
);
