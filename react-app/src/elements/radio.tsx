import { useMemo, useState } from 'react';
import clsx from 'clsx';

export const Radio = ({ label, checked, toggle }) => {
    return (
        <label className="flex items-center" onClick={toggle}>
            <div className={clsx('relative border w-5 h-5 flex rounded-full focus-within:border-blue-500 items-center justify-center', checked && 'bg-blue-500')}>
                <input type="checkbox" checked={checked} className="sr-only" />
                {checked && <div className="bg-white rounded-full w-2 h-2" />}
            </div>
            <span className="ml-2">{label}</span>
        </label>
    );
}
