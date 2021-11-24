/* This example requires Tailwind CSS v2.0+ */
import {Fragment, useState} from 'react';
import {Transition} from '@headlessui/react';
import {XIcon} from '@heroicons/react/solid';
import {Link} from 'react-router-dom';

export const Notification = () => {
  const [show, setShow] = useState(true);

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div aria-live="assertive" className="inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Sign up as creator first!</p>
                    <p className="mt-1 text-sm text-gray-500">Sign up so you can start getting subscribers!</p>
                    <div className="mt-4 flex">
                      <Link to="/upload">
                        <button
                          type="button"
                          className="inline-flex items-center animate-pulse px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Sign Up as Creator
                        </button>
                      </Link>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        setShow(false);
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};
