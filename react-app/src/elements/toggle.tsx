import clsx from 'clsx';

const classes = {
    wrapper: 'relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    active: 'bg-indigo-600',
    off: 'bg-gray-200',
    def: {
        wrapper: 'h-6 w-11',
        pointer: 'h-5 w-5',
        move: 'translate-x-5',
    },
    lg: {
        wrapper: 'h-8 w-20',
        pointer: 'h-7 w-7',
        move: 'translate-x-12',
    },
    position: 'translate-x-0',
    pointer: 'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
}
export const Toggle = ({ onClick, state, size = 'def' }) => {
    return (
        <button className={clsx(classes.wrapper, state ? classes.off : classes.active, classes[size].wrapper)} onClick={onClick}>
            <span className={clsx(classes.pointer, classes[size].pointer, state ? classes[size].move : classes.position)} />
        </button>
    )
};
