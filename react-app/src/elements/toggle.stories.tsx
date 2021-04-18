import { Toggle } from './toggle';
import { useState } from 'react';

export default {
    title: 'Elements'
}
export const Toggles = () => {
    const [state, setState] = useState(false);
    return (
        <div className="space-x-4">
            <Toggle onClick={() => setState(!state)} state={state} />
            <Toggle onClick={() => setState(!state)} state={state} size="lg" />
        </div>
    )
}
