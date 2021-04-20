import * as React from 'react';
import { Icon } from '../icons';
import { Button } from '../elements/button';
import {Link} from "react-router-dom";

const FilterItem = ({ avatar, title, subtitle, description, count, source, url }) => (
  <Link to={url}>
    <li className="py-4 flex">
        <img className="h-20 w-20 rounded-full" src={avatar} alt="" />
        <div className="ml-3">
            <p className="font-bold text-gray-900">{title}</p>
            <p className="text-sm text-gray-700">{subtitle}</p>
            <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
        <div className="ml-auto text-center">
            <p className="font-bold text-gray-900">{count}</p>
            <p className="mt-2 text-sm text-gray-500">{source}</p>
        </div>
    </li>
    </Link>
)
const SearchInput = ({ search }) => {
    const ref = React.useRef<any>(null);
    return (
        <div className="flex">
            <div className="flex rounded-full p-4 w-full bg-gray-100 items-center">
                <Icon name="search" className="text-gray-500" />
                <input ref={ref} placeholder="Filter creators" className="w-full bg-transparent focus:outline-none ml-4" onChange={() => search(ref.current?.value)}/>
            </div>
            <Button label="Search" className="ml-4 bg-red-600 text-white" onClick={() => search(ref.current?.value)} />
        </div>
    )
}
export const FilterList = ({ list }) => {
    const [items, setItems] = React.useState(list);
    const search = (value) => {
        const lowValue = value.toLowerCase();
        const newItems = list.filter((item) => item.title.toLowerCase().includes(lowValue));
        setItems(newItems);
    }
    return (
        <div className="relative p-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <SearchInput search={search} />
                <ul className="divide-y divide-gray-100">
                    {items.map((item) => <FilterItem key={item.title} {...item} />)}
                </ul>
            </div>
        </div>
    );
}
