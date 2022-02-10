/* This example requires Tailwind CSS v2.0+ */
import {Fragment, useContext, useState, useRef} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {LoginIcon} from '@heroicons/react/outline';
import {Web3UtilsContext} from '../Web3Utils';
import {Icon} from '../icons';
import {Button} from '../elements/button';
import {ExclamationIcon, XIcon} from '@heroicons/react/outline';
import WertWidget from '@wert-io/widget-initializer';
import {Web3Provider} from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

export default function WertModal() {
  const [open, setOpen] = useState(false);
  const web3utils = useContext(Web3UtilsContext);
  const context = useWeb3React<Web3Provider>();

  let wertWidget;
  if (context.account) {

    wertWidget = new WertWidget({
      "partner_id": "01FVHZVZD4KV95QAHB83DVN88Y",
      "container_id": "wert-widget",
      "origin": "https://widget.wert.io",
      "commodity": "USDC:Polygon",
      "address": context.account,
    });

  } else {

    wertWidget = new WertWidget({
      "partner_id": "01FVHZVZD4KV95QAHB83DVN88Y",
      "container_id": "wert-widget",
      "origin": "https://widget.wert.io",
      "commodity": "USDC:Polygon",
    });
  }

  const iframeSrc = wertWidget.getEmbedUrl();

 // iframe.setAttribute('allow', 'camera *; microphone *');

  return (
    <div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="absolute z-50 inset-0 overflow-y-auto" onClose={setOpen}>
          <div className="flex items-end justify-center min-h-screen text-center sm:block sm:p-0 ">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="relative inset-0 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle">
                <iframe className="h-128 w-96" src={iframeSrc} allow="camera;microphone"></iframe>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <div>
        <a className="cursor-pointer" onClick={() => setOpen(true)}>
          Buy Polygon USDC
        </a>
      </div>
    </div>
  );
}
