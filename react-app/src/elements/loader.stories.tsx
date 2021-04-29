import React, { useState } from 'react';
import LoaderComponent from "./loader";

export default {
    title: "Elements/Loader",
}

export const Loader = () => {
    return (
        <div className="flex max-w-7xl mx-auto justify-between flex-wrap">
            <div className="w-1/2 px-12 mt-8 flex items-center justify-center">
                <LoaderComponent className="text-indigo-600 w-16 h-16" />
            </div>
        </div>
    );
};
