import React, { useState } from 'react';
import { Checkbox as Component, CheckboxState } from './checkbox';

export default {
    title: "Elements/Inputs",
}

export const Checkbox = () => {
    const [state, setState] = useState(CheckboxState.checked);
    const toggle = () => setState(state%3 + 1);
    return (
        <div className="flex max-w-7xl mx-auto justify-between flex-wrap">
            <div className="w-1/2 px-12 mt-8">
                <Component label="Checkbox" state={state} toggle={toggle} />
                <Component label="Checkbox" state={CheckboxState.unchecked} toggle={() => {}} />
                <Component label="Checkbox" state={CheckboxState.partial} toggle={() => {}} />
            </div>
        </div>
    );
};
