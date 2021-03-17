import * as React from "react";
import {Input} from "./input";

export default {
    title: "Elements",
};

export const Inputs = (props) => (
    <div className="flex max-w-7xl mx-auto justify-between flex-wrap">
        <div className="w-1/2 px-12 mt-8">
            <h2 className="mb-12 text-3xl font-semibold text-gray-900">Input</h2>
            <div className="flex flex-col">
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Normal</h3>
                    <Input placeholder="Email address" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Active</h3>
                    <Input placeholder="Email address" type="email" value="Alex123@gmail.com" className="border-blue-dark ring-4 ring-blue-light" />
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Error</h3>
                    <div>
                        <Input value="Alex123@gmail" type="email" invalid />
                        <p className="mt-2 text-pink text-xs">Incorrect Email Address</p>
                    </div>
                </div>
                <div className="flex justify-center justify-between items-center border-b border-gray-100 py-6">
                    <h3 className="text-2xl text-gray-300">Disabled</h3>
                    <Input placeholder="Disabled" disabled />
                </div>
            </div>
        </div>
    </div>
)