import clsx from 'clsx'

const classes = {
    tab: 'border-transparent text-grey-dark hover:text-black hover:border-blue-primary border-b-4',
    tabActive: 'border-blue-primary text-black border-b-4',
    select: 'border-navy-dark text-black',
    border: 'border-b-2 border-grey',
}

interface TabProps {
    id: string
    name: string
}

interface TabsProps {
    tabs: TabProps[],
    active: string,
    setActive: (id: string) => void,
}

export default function Tabs({ tabs, active, setActive } : TabsProps) {
    const handleClick = (event, id) => {
        event.preventDefault();
        setActive(id)
    };

    return (
        <div>
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    Select a tab
                </label>
                <select
                    id="tabs"
                    name="tabs"
                    className={clsx(
                        'block w-full pl-3 pr-10 py-2 text-base  focus:outline-none sm:text-sm rounded-md',
                        classes.select,
                    )}
                    defaultValue={tabs.find((tab) => tab.id === active)?.name}
                    onChange={(event) => setActive(event.target.value)}
                >
                    {tabs.map((tab, index) => (
                        <option key={tab.name} value={tab.id}>
                            {tab.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <div className={classes.border}>
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <a
                                key={tab.id}
                                href={`#${tab.id}`}
                                className={clsx(
                                    tab.id === active ? classes.tabActive : classes.tab,
                                    'whitespace-nowrap px-2 py-4 font-bold text-sm',
                                )}
                                aria-current={tab.id === active ? 'page' : undefined}
                                onClick={(e) => handleClick(e, tab.id)}
                            >
                                {tab.name}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    )
}
