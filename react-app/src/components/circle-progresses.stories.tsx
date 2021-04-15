import { CircleProgress } from './circle-progress';
import { useState } from 'react';

export default {
    title: 'Components/Circle Progresses'
}

export const CircleProgresses = () => {
    const [value, setValue] = useState(20);
    return (
        <div>
            <input value={value} onChange={(e) => setValue(parseInt(e.target.value))} />
            <CircleProgress percent={value} />
        </div>
    )
}
