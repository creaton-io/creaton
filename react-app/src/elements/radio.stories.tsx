import React from 'react';
import { Radio as Component } from './radio';

export default {
    title: "Elements/Inputs",
}

export const Radio = () => {
    return (
        <div className="flex max-w-7xl mx-auto justify-between flex-wrap">
            <div className="w-1/2 px-12 mt-8">
                <Component label="Radio" checked toggle={() => {}} />
                <Component label="Radio" checked={false} toggle={() => {}} />
                <Component label="Radio" checked={false} toggle={() => {}} />
            </div>
        </div>
    );
};
