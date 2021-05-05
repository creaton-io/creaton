import * as React from "react"
import clsx from "clsx";
import {useState} from "react";



export default function StakeInputGroup({ label, max }) {
    const [value, setValue] = useState(0)

    return (
        <div className="w-full mx-auto">
            <div className="flex justify-between">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-semibold">
                    {label}
                </label>
                <button type="button" className="block text-sm font-medium text-primary font-semibold" onClick={() => setValue(max)}>Max</button>
            </div>
            <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <input
                        type="number"
                        name="number"
                        id="email"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 px-2"
                        min={0}
                        max={max}
                        value={value}
                        onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                    />
                </div>
                <button
                    type="button"
                    className={clsx(
                        "inline-flex items-center px-8 py-4",
                        "font-medium rounded-r-md leading-4",
                        "bg-blue-primary text-white",
                        "hover:bg-blue",
                        "active:bg-blue-dark",
                        "focus:outline-none focus:bg-blue focus:ring-1 focus:ring-blue focus:ring-offset-2",
                        "disabled:bg-grey disabled:text-grey-dark",
                    )}
                >
                    Stake
                </button>
            </div>
        </div>
    )
}
