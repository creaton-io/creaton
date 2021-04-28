import {ButtonHTMLAttributes, FC, useState} from "react";
import {Icon} from "../icons";
import clsx from "clsx";
import {VideoPlayer} from "../VideoPlayer";


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    price?: number;
    name?: string;
    description?: string,
    fileUrl?: string;
    fileType?: string;
    avatarUrl?: string;
}

export const Card: FC<ButtonProps> = ({ className,price,name,fileUrl, avatarUrl, fileType, description}) => {
    const [like, setLike] = useState(false);
    return (
        <div className="mb-5">
            <div className="flex flex-col rounded-2xl border p-8 overflow-hidden">
           
              {fileUrl && <div className="flex justify-center flex-shrink-0 my-6">
                  {fileType === "image" 
                  ? <img className="w-72 object-fit rounded-xl"
                     src={fileUrl}
                     alt=""/>
                     :  <VideoPlayer url={fileUrl}/>
    }
              </div>}
              <div className="flex-1 bg-white flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {name}
                    </h4>
                        <div>
                            <Icon onClick={() => setLike(!like)} name="heart" className={clsx('cursor-pointer',like ? 'text-red-500' : 'text-grey-dark')} />
                        </div>
                    </div>

                    <p>
                       {description}
                    </p>
                  {price && <div>
                        <span className="text-xs">
                            Subscribe for
                        </span>
                        <span className="font-semibold text-blue ml-2">
                            ${price} / month
                        </span>
                    </div>}
                </div>
            </div>
        </div>
    )
};
