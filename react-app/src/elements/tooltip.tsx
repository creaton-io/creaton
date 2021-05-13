import { usePopper } from 'react-popper';
import {useState} from "react";
import {createPortal} from "react-dom";
import clsx from "clsx";

export default function Tooltip({ content, children, hover = false }) {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(prev => !prev);
    const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'top',
        modifiers: [
            { name: 'arrow', options: {
                element: arrowElement,
            }},
            { name: 'offset', options: {
                offset: [0, 12]
            }}
        ],
    });

    return (
        <>
            <div ref={setReferenceElement}
                 onClick={!hover ? toggle : console.log}
                 onMouseOver={hover ? toggle : console.log}
                 onMouseOut={hover ? toggle : console.log}>
                {children}
            </div>
            {createPortal(
                visible ? <div
                    ref={setPopperElement}
                    style={styles.popper}
                    {...attributes.popper}
                    className={clsx("bg-black rounded-md text-white text-center w-full max-w-sm")}
                >
                    <div className="p-2">
                        {content}
                    </div>
                    <div ref={setArrowElement} style={styles.arrow}>
                        <div className="w-4 overflow-hidden inline-block flex items-center">
                            <div className="h-3 w-3 bg-black -rotate-45 transform origin-top-left" />
                        </div>
                    </div>
                </div> : null,
                document.querySelector('body')!
            )}
        </>
    );
};