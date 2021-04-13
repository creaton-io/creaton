import * as React from "react";
import { Icon } from "./index";
import { iconMap } from './font-awesome'

export default {
  title: "Icons",
};

const IconItem = ({ name }) => (
  <div className="text-center inline-block text-gray-500">
    <Icon name={name} size="4x" className="m-4" />
    <h4>{name}</h4>
  </div>
)

export const Default = () => Object.keys(iconMap).map(k => <IconItem name={k} key={k} />);
