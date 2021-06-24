import React, {ButtonHTMLAttributes, FC, useState} from "react";
import {Icon} from "../icons";
import clsx from "clsx";
import {VideoPlayer} from "../VideoPlayer";
import { Avatar } from './avatar';


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  price?: number;
  name?: string;
  description?: string,
  fileUrl?: string;
  fileType?: string;
  avatarUrl?: string;
  onLike?: any;
  onReport?: any;
  isLiked?: boolean;
  likeCount?: number;
  date?: string;
  isEncrypted?: boolean;
}

export const Card: FC<ButtonProps> = ({className, price, name, fileUrl, avatarUrl, fileType, description, isLiked, onLike, onReport, likeCount, date,isEncrypted}) => {
  if(isEncrypted)
  return (<div className="mb-5">
    <div className="flex flex-col rounded-2xl border border-opacity-10 overflow-hidden bg-white bg-opacity-5 filter drop-shadow-md shadow-md hover:shadow-lg">
      <div className="border-gray-200 text-center text-white bg-gray-700 text-xl w-full h-50 m-auto p-10">
        <Icon size="5x" name="lock"/>
      <p className="w-1/2 m-auto text-center text-white mt-4"><span>Encrypted content, only subscribers can see this</span></p>
      </div>
      <div className="p-8">
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">
              {name}
            </h4>
            <div className="flex justify-between">
              <div className=" mr-5 ">
              <Icon onClick={onLike} name="heart"
                className={clsx('cursor-pointer', isLiked ? 'text-green-500' : 'text-white')}/>
              <span className="ml-2 text-white">
                {likeCount}
              </span>
              </div>
              <Icon name="flag" className={clsx('text-gray-500 mt-1')}/>
            </div>
          </div>

          <h5 className="text-left text-sm text-gray-400 mb-2">
            {(new Date(parseInt(date!))).toLocaleString()}
          </h5>

          <p className="text-left text-white">
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
  </div>)
  return (
    <div className="mb-5">
      <div className="flex flex-col rounded-2xl border pr-8 pl-8 pb-8 border-opacity-10 overflow-hidden bg-white bg-opacity-5 filter drop-shadow-md shadow-md hover:shadow-lg">

        {fileUrl && <div className="flex justify-center flex-shrink-0 my-6">
          {fileType === "image"
            ? <img className="w-auto max-w-2xl rounded-xl"
                   src={fileUrl}
                   alt=""/>
            : <VideoPlayer url={fileUrl}/>
    }
              </div>}
              <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white">
                        {name}
                      </h4>
                      <div className="flex justify-between">
                        <div className=" mr-5 ">
                          <Icon onClick={onLike} name="heart"
                            className={clsx('cursor-pointer', isLiked ? 'text-green-500' : 'text-white')}/>
                          <span className="ml-2 text-white">
                            {likeCount}
                          </span>
                        </div>
                        <Icon  onClick={onReport} name="flag"
                              className={clsx('cursor-pointer text-gray-500 mt-1')}/>
                      </div>
                    </div>

                <h5 className="text-left text-sm text-gray-400 mb-2">
                  {(new Date(parseInt(date!))).toLocaleString()}
                </h5>

                <p className="text-left text-white">
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
