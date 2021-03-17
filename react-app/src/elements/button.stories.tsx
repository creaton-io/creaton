import * as React from "react";
import {Button} from "./button";

export default {
    title: "Elements",
};

export const Buttons = (props) => (
    <div className="flex max-w-7xl mx-auto justify-between flex-wrap">
        <div className="w-1/3 px-12 mt-8">
            <h2 className="mb-12 text-3xl font-semibold text-gray-900">Primary Button</h2>
            <div className="flex flex-col">
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Normal</h3>
                    <Button label="Primary Button" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Hover</h3>
                    <Button label="Primary Button" className="bg-blue" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Active</h3>
                    <Button label="Primary Button" className="bg-blue-dark" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Focus</h3>
                    <Button label="Primary Button" className="bg-blue ring-1 ring-blue ring-offset-2" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Disabled</h3>
                    <Button label="Primary Button" disabled />
                </div>
            </div>
        </div>
        <div className="w-1/3 px-12 mt-8">
            <h2 className="mb-12 text-3xl font-semibold text-gray-900">Secondary Button</h2>
            <div className="flex flex-col">
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Normal</h3>
                    <Button theme="secondary" label="Primary Button" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Hover</h3>
                    <Button theme="secondary" label="Primary Button" className="border-blue-primary" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Active</h3>
                    <Button theme="secondary" label="Primary Button" className="border-line" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Focus</h3>
                    <Button theme="secondary" label="Primary Button" className="bg-blue-light border-blue-primary ring-4 ring-blue-light" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Disabled</h3>
                    <Button theme="secondary" label="Primary Button" disabled />
                </div>
            </div>
        </div>
        <div className="w-1/3 px-12 mt-8">
            <h2 className="mb-12 text-3xl font-semibold text-gray-900">Secondary Button 2</h2>
            <div className="flex flex-col">
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Normal</h3>
                    <Button theme="secondary-2" label="Primary Button" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Hover</h3>
                    <Button theme="secondary-2" label="Primary Button" className="bg-blue-light-150" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Active</h3>
                    <Button theme="secondary-2" label="Primary Button" className="bg-blue-light-200" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Focus</h3>
                    <Button theme="secondary-2" label="Primary Button" className="bg-blue-light ring-4 ring-blue-light border border-blue-primary" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Disabled</h3>
                    <Button theme="secondary-2" label="Primary Button" disabled />
                </div>
            </div>
        </div>
        <div className="w-full px-12 mt-8">
            <h2 className="mb-12 text-3xl font-semibold text-gray-900">Usage Example</h2>
            <Button label="Confirm" className="mr-8" />
            <Button label="Subscribe for $5" className="mr-8" />
            <Button label="Blog Post" className="mr-8" theme="secondary" />
            <Button label="Cancel" className="mr-8" theme="secondary-2" />
        </div>
    </div>
);
