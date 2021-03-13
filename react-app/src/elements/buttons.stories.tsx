import * as React from "react";
import {Button as Component} from "./buttons";

export default {
    title: "Elements",
};

export const Buttons = (props) => (
    <div className="flex max-w-7xl mx-auto">
        <div className="w-1/4">
            <h2 className="mb-12 text-4xl font-semibold text-gray-900">Primary Button</h2>
            <div className="flex flex-col">
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Normal</h3>
                    <Component label="Primary Button" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Hover</h3>
                    <Component label="Primary Button" className="bg-blue" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Active</h3>
                    <Component label="Primary Button" className="bg-blue-dark" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Focus</h3>
                    <Component label="Primary Button" className="bg-blue ring-1 ring-blue ring-offset-2" />
                </div>
                {/*<div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">*/}
                {/*    <h3 className="text-2xl text-gray-300">Disable</h3>*/}
                {/*    <Component label="Primary Button" className="bg-gray-400 text-gray-600" />*/}
                {/*</div>*/}
            </div>
        </div>
    </div>
);
