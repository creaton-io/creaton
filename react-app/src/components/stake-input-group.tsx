import * as React from "react"
import clsx from "clsx";
import {useState} from "react";



export default function StakeInputGroup({ label, max, buttonLabel,amount, setStakeAmount, stakeAction }) {
    return (
      <div className="m-2 p-2 border-2 rounded-md  border-white border-opacity-10">
        <div className="w-full mx-auto">
            <div className="flex justify-between">
                <label htmlFor="email" className="block text-sm font-medium text-white font-semibold">
                    {label}
                </label>
                <button type="button" className="block text-sm font-medium text-white font-semibold" onClick={() => setStakeAmount(max)}>Max</button>
            </div>
            <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <input
                        type="number"
                        name="number"
                        id="email"
                        className="focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 px-2 bg-white bg-opacity-20"
                        min={0}
                        max={max}
                        value={amount}
                        onChange={(event) => setStakeAmount(parseInt(event.target.value))}
                    />
                </div>
                <button
                    type="button"
                    className={clsx(
                        "inline-flex items-center px-8 py-4",
                        "font-medium rounded-r-md leading-4",
                        "bg-white bg-opacity-10 text-white",
                        "hover:bg-opacity-5",
                        "active:bg-opacity-5",
                        "focus:outline-none focus:bg-opacity-5 focus:ring-1 focus:ring-white focus:ring-offset-2",
                        "disabled:bg-grey disabled:text-grey-dark",
                    )}
                    onClick={stakeAction}
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
      </div>
    )
}
