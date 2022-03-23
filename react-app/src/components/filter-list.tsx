import * as React from 'react';
import { Icon } from '../icons';
import { Avatar } from './avatar';
import { Button } from '../elements/button';
import {Link} from "react-router-dom";

const FilterItem = ({ avatar, title, subtitle, description, count, source, url }) => (
<div className="bg-white bg-opacity-5 mb-4 rounded-xl shadow-md border border-opacity-10 border-gray-100/10 transition transform hover:shadow-lg">
  <Link to={url}>
    <li className="py-4 px-6 flex">
        <Avatar size="profile" src={avatar}></Avatar>
        <div className="ml-3">
            <p className="font-bold text-white">{title}</p>
            <p className="text-sm text-white">{subtitle}</p>
            <p className="mt-2 text-sm text-gray-200">{description}</p>
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
        <div className="flex justify-center pt-6 pb-4 sm:pb-8">
            <div className="flex rounded-xl bg-white text-white bg-opacity-5 ring-4 sm:ring-8 ring-black ring-opacity-25 p-3 mb-5 w-full sm:w-2/3 items-center">
                <Icon name="search" className="text-gray-500" />
                <input ref={ref} placeholder="Search for creators" className="w-full bg-transparent focus:outline-none ml-3" onChange={() => search(ref.current?.value)}/>
            </div>
            <Button label="Search" size="small" className="hidden ml-4 bg-red-600 text-white h-14" onClick={() => search(ref.current?.value)} />
        </div>
    )
}
export const FilterList = ({ list }) => {
  const [searchValue, setSearchValue] = React.useState('');
  const filteredItems = list.filter((item) => item.title.toLowerCase().includes(searchValue.toLowerCase()));
  return (
    <div className="relative p-3 sm:p-4">
      <div className="max-w-7xl mx-auto sm:px-6">
        <SearchInput search={setSearchValue}/>
        <ul>
          {filteredItems.map((item) => <FilterItem key={item.title} {...item} />)}
        </ul>
      </div>
    </div>
  );
}
