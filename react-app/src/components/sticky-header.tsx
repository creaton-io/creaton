import {Button} from "../elements/button";
import {ButtonHTMLAttributes, FC, useEffect, useRef} from 'react';
import {Avatar} from "./avatar";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    src?: string;
    link?: string;
    name?: string;
}

export const StickyHeader: FC<ButtonProps> = ({src, name, link}) => {
    const ref = useRef<any>(null);

    useEffect(() => {
        const { offsetTop } = ref.current

        function onScroll() {
            if (window.pageYOffset > offsetTop) {
                ref.current.classList.add("sticky");
                ref.current.classList.replace("h-0", "h-auto");
                ref.current.style.transform = "translateY(0px)"
            } else {
                ref.current.classList.remove("sticky");
                ref.current.classList.replace("h-auto", "h-0");
                ref.current.style.transform = "translateY(-100%)"
            }
        }
        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    })

    return (
        <div className="top-0 transition-all ease-in-out z-50 overflow-hidden h-0 duration-500" ref={ref} style={{ transform: "translateY(-100%)" }}>
            <div className="border-b border-b-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="relative flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <Avatar size="profile" src={src} />
                            </div>
                            <h4 className="text-2xl font-semibold ml-4">{name}</h4>
                        </div>
                        <div>
                            <Button label="Subscribe" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
