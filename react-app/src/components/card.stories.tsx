import * as React from "react";
import {Card} from "./card";

export default {
    title: "Components",
};

export const Cards = (props) => (
    <div className="flex max-w-7xl mx-auto justify-between flex-wrap">
        <Card />
    </div>
);
