import {ButtonHTMLAttributes, FC, useContext, useEffect, useState} from 'react';
import {Icon} from '../icons';
import clsx from 'clsx';
import {VideoPlayer} from '../VideoPlayer';
import {Parser as HtmlToReactParser} from 'html-to-react';
import {Splash} from './splash';
import LitJsSdk from 'lit-js-sdk';
import { LitContext } from '../LitProvider';
import { ethers } from 'ethers';
import { LinkPreview } from '@dhaiwat10/react-link-preview';
import Tooltip from '../elements/tooltip';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  price?: number;
  name?: string;
  description?: string;
  altText?: string;
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
  link?: string;
}

export const Card: FC<ButtonProps> = ({
  className,
  price,
  name,
  fileUrl,
  avatarUrl,
  altText,
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
  link,
}) => {
  const litNode = useContext(LitContext);
  const [stakingAmount, setStakingAmount] = useState('');
  const [reacting, setReacting] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [reactCount, setReactCount] = useState<number>();
  const [descriptionReactElement, setDescriptionReactElement] = useState('');
  const [linkContent, setLinkContent] = useState('');

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

      if(!description || !link) return;
      let desc: string = description;

      const regexSubscribersText = /<p class="subscribersText" \/>/gmi

      if(!canDecrypt){
        console.log(desc.match(regexSubscribersText));
        desc = desc.replace(regexSubscribersText, '<p class="subscribersText">YOU NEED TO SUBSCRIBE TO SEE THIS TEXT</p>');
        description = desc;

        if(link.indexOf("data:application/zip") === 0){
          link = "YOU NEED TO SUBSCRIBE TO SEE THIS LINK";
        }

      } else{
          try{
            let authSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'mumbai'});
  
            // Description
            const regex = /<p class="encryptedText">((.|\n)*?)<\/p>/gmi
            const matches = desc.match(regex);
      
            if(matches){
              desc = desc.replace(regex, "");
              const encryptedZipBlob = base64ToBlob(matches[0].slice(25,-4));
              let {decryptedFile} = await LitJsSdk.decryptZipFileWithMetadata({
                authSig: authSig,
                file: encryptedZipBlob,
                litNodeClient: litNode,
              });
              
              const decBlob = new Blob([decryptedFile], {type: 'application/json'});
              console.log('SHIT LINK', decBlob);
              const decDecryptedText = JSON.parse(await decBlob.text());
    
              const reversed = Array.from(desc.matchAll(regexSubscribersText)).reverse();
    
              let counter = reversed.length-1;
              for(let v of reversed){
                desc = desc.slice(0, v.index) + decDecryptedText[counter] + desc.slice(v.index as number + v[0].length);
                counter--;
              }

              description = desc;
            }

            //Link
            if(link && link.indexOf("data:application/zip") === 0){
              const encryptedLinkZipBlob = base64ToBlob(link);
              authSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'mumbai'});
              let decrypted = await LitJsSdk.decryptZipFileWithMetadata({
                authSig: authSig,
                file: encryptedLinkZipBlob,
                litNodeClient: litNode,
              });

              const linkBlob = new Blob([decrypted.decryptedFile], {type: 'application/json'});
              link = JSON.parse(await linkBlob.text());
            }
            
          } catch(e) {
            console.error('Error while decrypting text: ', e);
            link = '';
          }
      }


      const htmlToReactParser = new HtmlToReactParser();
      setDescriptionReactElement(htmlToReactParser.parse(description));
      setLinkContent(link as string);
    })()
  },[description, link, canDecrypt]);


  if (isEncrypted)
    return (
      <div className="mb-5">
        <div className="flex flex-col rounded-2xl border border-gray-100/10 overflow-hidden bg-white bg-opacity-5 filter drop-shadow-md shadow-md hover:shadow-lg">
          <div className="border-gray-200 text-center text-white bg-gray-700 text-xl w-full h-50 m-auto p-10">
            <Icon size="5x" name="lock" />
            <p className="w-1/2 m-auto text-center text-white mt-4">
              <span>Encrypted content, only subscribers can see this</span>
            </p>
          </div>
          <div className="p-8">
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold truncate text-white">{name}</h4>
                <div className="flex justify-between">
                  <Icon name="flag" className={clsx('text-gray-500 mt-1 mr-5')} />
                  <Tooltip content={<div>Hide content from public</div>} hover>
                    <Icon
                      onClick={onHide}
                      name={hide ? 'eye-slash' : 'eye'}
                      className={clsx('cursor-pointer text-red-500 mt-1 ' + hide ? 'text-red-500' : 'text-green-300' && isCreator ? ' visible' : ' invisible')}
                    />
                  </Tooltip>
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
      <div className="flex flex-col rounded-2xl border border-gray-100/10 pr-8 pl-8 pb-8 bg-white bg-opacity-5 filter drop-shadow-md shadow-md hover:shadow-lg">
        {fileUrl && (
          <div className="flex justify-center flex-shrink-0 my-6">
            {fileType === 'image' && <img className="w-auto md:max-w-2xl max-w-full rounded-xl" src={fileUrl} alt={altText?altText:""} />}
            {fileType === 'video' && <VideoPlayer url={fileUrl} />}
          </div>
        )}

        {!fileUrl && <Splash src="https://assets1.lottiefiles.com/packages/lf20_igknxpyc.json"></Splash>}

        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold truncate text-white">{name}</h4>
            <div className="flex justify-between">
              <Tooltip
                      content={
                        <div>
                          Soon TM
                        </div>
                      }
                      hover
                    >
              <div className=" mr-5 ">

                          {!reacting && !hasReacted && 
                            <button onClick={(e) => showAmountModal(e)} className={clsx('cursor-pointer', 'text-white', 'reactButton')}> 
                              <img src="/assets/images/logo.png" className="svg-inline--fa cursor-pointer" />
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
              </Tooltip>
              <Icon onClick={onReport} name="flag" className={clsx('cursor-pointer text-gray-500 mt-1 mr-5')} />
              
              <Tooltip content={<div>Hide content from public</div>} hover>
                <Icon
                  onClick={onHide}
                  name={hide ? 'eye-slash' : 'eye'}
                  className={clsx(isCreator ? (hide ? 'text-red-500 cursor-pointer mt-1' : 'text-green-300 cursor-pointer mt-1') : ' invisible')}
                />
              </Tooltip>
            </div>
          </div>

          <h5 className="text-left text-sm text-gray-400 mb-2">{new Date(parseInt(date!)).toLocaleString()}</h5>

          <div className="text-left text-white">{descriptionReactElement}</div>

          {linkContent && <div className="text-left text-white mt-2"><span className="font-bold">Link: </span><a target="_blank" href={linkContent}>{linkContent}</a></div>}
          {linkContent && <LinkPreview url={linkContent} showLoader={false} /> }

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
