import React, { useState } from 'react';
import { Checkbox as Component, CheckboxState } from './checkbox';

export default {
    title: "Elements/Inputs",
}

export const Checkbox = () => {
    const [checked, setChecked] = useState(false);

    return (
        <div className="flex max-w-7xl mx-auto justify-between flex-wrap">
            <div className="w-1/2 px-12 mt-8">
                <div className="mb-4">value: {checked.toString().toUpperCase()}</div>
                <Component label="Checkbox" checked={checked} onChange={() => setChecked(prev => !prev)} />
            </div>
        </div>
    );
};