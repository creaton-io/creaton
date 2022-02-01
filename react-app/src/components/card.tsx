import {ButtonHTMLAttributes, FC, useContext, useEffect, useState} from 'react';
import {Icon} from '../icons';
import clsx from 'clsx';
import {VideoPlayer} from '../VideoPlayer';
import {Parser as HtmlToReactParser} from 'html-to-react';
import {Splash} from './splash';
import LitJsSdk from 'lit-js-sdk';
import { LitContext } from '../LitProvider';
import { ethers } from 'ethers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  price?: number;
  name?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  avatarUrl?: string;
  onLike?: any;
  onReport?: any;
  isLiked?: boolean;
  likeCount?: number;
  onReact?: any;
  hasReacted?: boolean;
  initialReactCount?: string;
  date?: string;
  isEncrypted?: boolean;
  reactionErc20Available?: string;
  reactionErc20Symbol?: string;
  hide?: boolean;
  onHide?: any;
  isCreator?: boolean;
  canDecrypt?: boolean;
}

export const Card: FC<ButtonProps> = ({
  className,
  price,
  name,
  fileUrl,
  avatarUrl,
  fileType,
  description,
  isLiked,
  onLike,
  onReport,
  likeCount,
  onReact,
  hasReacted,
  initialReactCount,
  date,
  isEncrypted,
  reactionErc20Available,
  reactionErc20Symbol,
  hide,
  onHide,
  isCreator,
  canDecrypt,
}) => {
  const litNode = useContext(LitContext);
  const [stakingAmount, setStakingAmount] = useState('');
  const [reacting, setReacting] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [reactCount, setReactCount] = useState<number>();
  const [descriptionReactElement, setDescriptionReactElement] = useState('');

  function showAmountModal(e) {
    hideAllAmountModal();
    e.target.parentElement.parentElement.getElementsByClassName('reactAmount')[0].classList.remove('hidden');
  }

  function hideAllAmountModal() {
    const modals = document.getElementsByClassName('reactAmount');
    for (let key in modals) {
      let el = modals[key].classList;
      if (el) {
        el.add('hidden');
      }
    }
  }

  function reactClick() {
    setReacting(true);
    hideAllAmountModal();
    if (!isNaN(+stakingAmount)) {
      onReact(stakingAmount, () => {
        setReactCount(+(reactCount + stakingAmount));
        setReacting(false);
      });
    }
  }

  function base64ToBlob(base64Data: string) {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const decodedData = window.atob(parts[1]);

    const uInt8Array = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }

  useEffect(() => {
    ;(async () => {
      setReactCount(initialReactCount ? +initialReactCount : 0);

      if(!description) return;
      let desc: string = description;

      const regexSubscribersText = /<p class="subscribersText" \/>/gmi

      if(!canDecrypt){
        console.log('here cant decrypt');
        console.log(desc.match(regexSubscribersText));
        desc = desc.replace(regexSubscribersText, '<p class="subscribersText">YOU NEED TO SUBSCRIBE TO SEE THIS TEXT</p>');
        description = desc;
      } else{
        const regex = /<p class="encryptedText">((.|\n)*?)<\/p>/gmi
        const matches = desc.match(regex);
  
        if(matches){
          desc = desc.replace(regex, "");
  
          try{
            const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'mumbai'});
  
            const encryptedZipBlob = base64ToBlob(matches[0].slice(25,-4));
            let {decryptedFile} = await LitJsSdk.decryptZipFileWithMetadata({
              authSig: authSig,
              file: encryptedZipBlob,
              litNodeClient: litNode,
            });
  
            const blob = new Blob([decryptedFile], {type: 'application/json'});
            const decryptedText = JSON.parse(await blob.text());
  
            const reversed = Array.from(desc.matchAll(regexSubscribersText)).reverse();
  
            let counter = reversed.length-1;
            for(let v of reversed){
              desc = desc.slice(0, v.index) + decryptedText[counter] + desc.slice(v.index as number + v[0].length);
              counter--;
            }
            
          } catch(e) {
            console.error('Error while decrypting text: ', e);
          }

          description = desc;
        }
      }


      const htmlToReactParser = new HtmlToReactParser();
      setDescriptionReactElement(htmlToReactParser.parse(description))
    })()
  },[description]);


  if (isEncrypted)
    return (
      <div className="mb-5">
        <div className="flex flex-col rounded-2xl border border-opacity-10 overflow-hidden bg-white bg-opacity-5 filter drop-shadow-md shadow-md hover:shadow-lg">
          <div className="border-gray-200 text-center text-white bg-gray-700 text-xl w-full h-50 m-auto p-10">
            <Icon size="5x" name="lock" />
            <p className="w-1/2 m-auto text-center text-white mt-4">
              <span>Encrypted content, only subscribers can see this</span>
            </p>
          </div>
          <div className="p-8">
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">{name}</h4>
                <div className="flex justify-between">
                  <div className=" mr-5 ">
                    <Icon
                      onClick={onLike}
                      name="heart"
                      className={clsx('cursor-pointer', isLiked ? 'text-green-500' : 'text-white')}
                    />
                    <span className="ml-2 text-white">{likeCount}</span>
                  </div>
                  <Icon name="flag" className={clsx('text-gray-500 mt-1 mr-5')} />
                  <Icon
                    onClick={onHide}
                    name={hide ? 'eye-slash' : 'eye'}
                    className={clsx('cursor-pointer text-red-500 mt-1 ' + hide ? 'text-red-500' : 'text-green-300')}
                  />
                </div>
              </div>

              <h5 className="text-left text-sm text-gray-400 mb-2">{new Date(parseInt(date!)).toLocaleString()}</h5>

              {/* <p className="text-left text-white"> */}
              {descriptionReactElement}
              {/* </p> */}

              {price && (
                <div>
                  <span className="text-xs">Subscribe for</span>
                  <span className="font-semibold text-blue ml-2">${price} / month</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <div className="mb-5">
      <div className="flex flex-col rounded-2xl border pr-8 pl-8 pb-8 border-opacity-10 bg-white bg-opacity-5 filter drop-shadow-md shadow-md hover:shadow-lg">
        {fileUrl && (
          <div className="flex justify-center flex-shrink-0 my-6">
            {fileType === 'image' && <img className="w-auto max-w-2xl rounded-xl" src={fileUrl} alt="" />}
            {fileType === 'video' && <VideoPlayer url={fileUrl} />}
          </div>
        )}

        {!fileUrl && <Splash src="https://assets1.lottiefiles.com/packages/lf20_igknxpyc.json"></Splash>}

        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">{name}</h4>
            <div className="flex justify-between">
              <div className=" mr-5 ">
                <Icon
                  onClick={onLike}
                  name="heart"
                  className={clsx('cursor-pointer', isLiked ? 'text-green-500' : 'text-white')}
                />
                <span className="ml-2 text-white">{likeCount}</span>
              </div>
              <div className=" mr-5 ">
                          {!reacting && !hasReacted && 
                            <button onClick={(e) => showAmountModal(e)} className={clsx('cursor-pointer', 'text-white', 'reactButton')}> 
                              <img src="/assets/images/logo.png" className="svg-inline--fa fa-w-16 cursor-pointer" />
                            </button> 
                          }

                          <div className="reactAmount hidden absolute p-3 mt-1 rounded right-2" style={{
                            backgroundColor: "rgb(41 25 67 / 70%)",
                            border: "1px solid #473a5f"
                          }}>
                            
                            {!reacting && <>
                              <div>
                                <input name="reactAmount" onChange={(e) => setStakingAmount(e.target.value)} className="text-white rounded" style={{
                                  background: "#452e6d",
                                  padding: "5px 7px"
                                }} />
                                <button onClick={reactClick} className="px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-green to-indigo-400 text-white hover:bg-green-900 active:bg-green-900 focus:outline-none focus:bg-blue focus:ring-1 focus:ring-blue focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-900 disabled:cursor-default ml-2">
                                  React!
                                </button>                              
                              </div>
                              <div className="block text-white text-sm mt-2 font-light">
                                {reactionErc20Available && Math.round(+ethers.utils.formatEther(reactionErc20Available) * 1e2) / 1e2} {reactionErc20Symbol} available
                              </div>
                            </>
                            }
                          </div>

                          {!reacting && hasReacted && 
                            <img src="/assets/images/logo.png" className="svg-inline--fa fa-w-16" />
                          }
                          { reacting && 
                            <svg className="inline-block animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          }
                          <span className="ml-2 text-white">
                            {reactCount}
                          </span>
                        </div> 
              <Icon onClick={onReport} name="flag" className={clsx('cursor-pointer text-gray-500 mt-1 mr-5')} />
              <Icon
                onClick={onHide}
                name={hide ? 'eye-slash' : 'eye'}
                className={clsx(hide ? 'text-red-500 cursor-pointer mt-1' : 'text-green-300 cursor-pointer mt-1')}
              />
            </div>
          </div>

          <h5 className="text-left text-sm text-gray-400 mb-2">{new Date(parseInt(date!)).toLocaleString()}</h5>

          <div className="text-left text-white">{descriptionReactElement}</div>

          {price && (
            <div>
              <span className="text-xs">Subscribe for</span>
              <span className="font-semibold text-blue ml-2">${price} / month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
