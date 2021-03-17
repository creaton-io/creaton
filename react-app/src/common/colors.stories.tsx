import * as React from "react";
import { ColorsPallet as Component } from "./colors";
import { colorsMockData } from "./colors.mock";

export default {
    title: "Common",
};

export const ColorsPallet = (props) => <Component {...colorsMockData} />;
