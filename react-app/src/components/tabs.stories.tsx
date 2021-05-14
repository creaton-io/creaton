import * as React from 'react';
import TabsComponent from './tabs'
import {useState} from "react";

export default {
    title: 'Components'
}

export const Tabs = () => {
    const tabs = [
        {id: 'tabs_a', name: 'Tabs A'},
        {id: 'tabs_b', name: 'Tabs B'},
        {id: 'tabs_c', name: 'Tabs C'}
    ]

    const [active, setActive] = useState(tabs[0].id);

    return (
        <div className="max-w-7xl mx-auto">
            <TabsComponent tabs={tabs} active={active} setActive={setActive} />
        </div>
    )
};
