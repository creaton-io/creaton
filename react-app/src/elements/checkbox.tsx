import { useMemo, useState } from 'react';
import clsx from 'clsx';
// import checked from '../../public/assets/svgs/checked.svg';
// import partial from '../../public/assets/svgs/partial-checked.svg';

export enum CheckboxState {
    unchecked,
    checked,
    partial
}
export const Checkbox = ({ label, state, toggle }) => {
    const content = useMemo(() => {
        switch (state) {
            case CheckboxState.checked:
                return <img src="./assets/images/checked.png"/>;
                // return <img src={checked} />;
            case CheckboxState.partial:
                return <img src="./assets/images/partial-checked.png"/>;
                // return <img src={partial} />
            default:
                return;
        }
    }, [state]);
    return (
        <label className="flex items-center" onClick={toggle}>
            <div className={clsx('relative border w-5 h-5 flex rounded-md focus-within:border-blue-500 items-center justify-center', state === CheckboxState.checked && 'bg-blue-500', state === CheckboxState.partial && 'border-blue-500')}>
                <input type="checkbox" className="sr-only" />
                {content}
            </div>
            <span className="ml-2">{label}</span>
        </label>
    );
}
