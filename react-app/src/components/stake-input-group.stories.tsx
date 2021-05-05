import React, { useState } from 'react';
import StakeInputGroupComponent from "./stake-input-group";

export default {
    title: "Elements/StakeInputGroup",
}

export const StakeInputGroup = () => {
    return (
        <div className="flex max-w-7xl mx-auto justify-between flex-wrap">
            <div className="w-1/3 mx-auto px-12 mt-8 flex items-center justify-center">
                <StakeInputGroupComponent label="How much to stake?" max={1000} />
            </div>
        </div>
    );
};
