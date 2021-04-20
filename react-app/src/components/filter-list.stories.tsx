import { FilterList as Component } from './filter-list';

export default {
    title: 'Elements'
}
const list = [
    {
        avatar: 'https://picsum.photos/1/200',
        title: 'Bobby Wilson',
        subtitle: 'creating yoga and movement classes',
        description: '105 videos, 43 livestreams, 4 polls',
        count: '172',
        source: 'PATRONS',
    },
    {
        avatar: 'https://picsum.photos/2/200',
        title: 'Bobby Theater',
        subtitle: 'creating yoga and movement classes',
        description: '105 videos, 43 livestreams, 4 polls',
        count: '172',
        source: 'PATRONS',
    },
    {
        avatar: 'https://picsum.photos/3/200',
        title: 'Marionette Theater',
        subtitle: 'creating sprinkles of stardust and puppetry joy for all!',
        description: '67 images, 8 videos, 4 polls',
        count: '166',
        source: 'PATRONS',
    },
    {
        avatar: 'https://picsum.photos/4/200',
        title: 'Gymlan Wilson',
        subtitle: 'creating content about bigfoot and other mysterious topics',
        description: '4 videos',
        count: '154',
        source: 'PATRONS',
    },
    {
        avatar: 'https://picsum.photos/5/200',
        title: 'Baker Theater',
        subtitle: 'creating sprinkles of stardust and puppetry joy for all!',
        description: '67 images, 8 videos, 4 polls',
        count: '166',
        source: 'PATRONS',
    },
    {
        avatar: 'https://picsum.photos/6/200',
        title: 'Bob Gymlan',
        subtitle: 'creating content about bigfoot and other mysterious topics',
        description: '4 videos',
        count: '154',
        source: 'PATRONS',
    },
];
export const FilterList = () => <Component list={list} />;
