import * as React from 'react';
import { Icon } from '../icons';
import { Avatar } from './avatar';
import { Button } from '../elements/button';
import {Link} from "react-router-dom";

const FilterItem = ({ avatar, title, subtitle, description, count, source, url }) => (
<div className="bg-white bg-opacity-5 mb-4 rounded-xl">
  <Link to={url}>
    <li className="py-4 px-6 flex">
        <Avatar size="profile" src={avatar}></Avatar>
        <div className="ml-3">
            <p className="font-bold text-white">{title}</p>
            <p className="text-sm text-white">{subtitle}</p>
            <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
        <div className="ml-auto text-center">
            <p className="font-bold text-white">{count}</p>
            <p className="mt-2 text-sm text-white">{source}</p>
        </div>
    </li>
    </Link>
</div>
)
const SearchInput = ({ search }) => {
    const ref = React.useRef<any>(null);
    return (
        <div className="flex">
            <div className="flex rounded-full p-4 mb-5 w-full bg-gray-100 items-center">
                <Icon name="search" className="text-gray-500" />
                <input ref={ref} placeholder="Filter creators" className="w-full bg-transparent focus:outline-none ml-4" onChange={() => search(ref.current?.value)}/>
            </div>
            <Button label="Search" size="small" className="ml-4 bg-red-600 text-white h-14" onClick={() => search(ref.current?.value)} />
        </div>
    )
}
export const FilterList = ({ list }) => {
  const [searchValue, setSearchValue] = React.useState('');
  const filteredItems = list.filter((item) => item.title.toLowerCase().includes(searchValue.toLowerCase()));
  return (
    <div className="relative p-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SearchInput search={setSearchValue}/>
        <ul className="divide-y divide-gray-100">
          {filteredItems.map((item) => <FilterItem key={item.title} {...item} />)}
        </ul>
      </div>
    </div>
  );
}
