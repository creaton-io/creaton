import {gql, useQuery} from "@apollo/client";
import React, {CSSProperties} from "react";
import {Link} from "react-router-dom";

const CREATORS_QUERY = gql`
  query {
  creators(orderBy: timestamp, orderDirection: desc, first: 10) {
    id
    user
    creatorContract
    description
    subscriptionPrice
    timestamp
  }
}
`;

const telegramStyle = {
  fillRule: "evenodd",
  clipRule: "evenodd",
  strokeLinejoin: "round",
  strokeMiterlimit: 1.41421,
}

const backgroundImage = {
  backgroundImage: "url(https://static.shuffle.dev/uploads/files/c9/c9d217321b054bd84b6eb32c4472c67a9ff8a86b/pngtree-camouflage-gradient-background-color-mixing-apple-wind-image-34341.jpg)"
}

function Home() {
  return (
    <div>
        <div className="relative bg-white overflow-hidden z-40">
          <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full" aria-hidden="true">
            <div className="relative h-full max-w-7xl mx-auto"></div>
          </div>
          <div className="relative pt-6 pb-16 sm:pb-24">
            <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
              <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="px-5 pt-4 flex items-center justify-between">
                  <div><img className="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" alt=""/></div>
                    <div className="-mr-2">
                      <button type="button" className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                      <span className="sr-only">Close menu</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                </div>
                <div className="px-2 pt-2 pb-3"><a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Product</a><a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Features</a><a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Marketplace</a><a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Company</a></div>
                <a href="#" className="block w-full px-5 py-3 text-center font-medium text-indigo-600 bg-gray-50 hover:bg-gray-100">Log in</a>
              </div>
            </div>
            <main>
              <div>
                <img className="hidden lg:block absolute top-0 left-0 w-1/3 h-full object-cover rounded-br-lg" src="https://static.shuffle.dev/uploads/files/c9/c9d217321b054bd84b6eb32c4472c67a9ff8a86b/pngtree-camouflage-gradient-background-color-mixing-apple-wind-image-34341.jpg" alt=""/>
                <span className="hidden lg:flex justify-center absolute -mt-12 top-24 clip-24 left-0 w-1/3 h-full object-cover pattern overflow-hidden">
                  <div className="absolute hidden lg:block ">
                    <div className="max-w-full px-4 py-4 mx-auto">
                      <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:max-w-none">
                        <div className="flex flex-col rounded-2xl border p-8 overflow-hidden bg-white">
                          <div className="flex-1 bg-white flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <div className="flex-shrink-0">
                                <a href="#"><img className="h-8 w-8 rounded-full object-cover" src="https://arweave.net/BhAz8CXTxUVM0h0tLQ-bF_nnjEkDpwrjRg--DFL2AXc" alt="avatar" /></a>
                              </div>
                              <div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 my-6"><img className="h-72 w-80 object-cover filter blur-sm" src="https://arweave.net/MwkwnM2Hh65SM2JtGVCjYbpAO_-ONFpqT17_mEfirtI" /></div>
                          <div>
                            <div className="flex justify-between items-center">
                              <h4 className="text-lg font-semibold text-gray-900">Alexander</h4>
                              ❤️
                            </div>
                            <div><span className="text-xs">Subscribe for</span><span className="font-semibold text-blue ml-2">$6</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </span>
              </div>
              <div className="relative container px-4 mx-auto">
                <div className="w-full lg:w-3/5 lg:pl-16 ml-auto">
                  <div className="mt-10 lg:mt-20 max-w-2xl lg:pr-10">
                    <div className="max-w-xl">
                      <h2 className="mb-3 lg:mb-6 text-4xl lg:text-5xl font-semibold">Connect Directly</h2>
                      <h3 className="mb-6 lg:mb-12 text-2xl lg:text-3xl">Engage Fans, Build an Unstoppable Income</h3>
                      <p className="max-w-md mb-6 lg:mb-14 text-gray-800 leading-loose">
                            <b>Web3 Membership Platform that gives you:</b>
                      <br />✔️ Subscription income from fans in real-time
                      <br />✔️ Ownership of your content - With NFT's
                      <br />✔️ Permanent storage - Content is forever available
                      <br />✔️ Super low fees - No middlemen
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap mb-16 lg:mb-12">
                    <a className="block w-full md:w-auto text-center mb-2 py-4 px-8 md:mr-4 text-sm text-white font-medium leading-normal rounded transition duration-200 to-indigo-700 bg-gradient-to-l from-indigo-500 hover:from-indigo-400 hover:to-indigo-600" href="https://discord.gg/pPMk9bcarf">Join Discord to get in the waitlist!</a></div>
                  <div className="flex flex-wrap items-center justify-center lg:w-96">
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12"><a href="https://github.com/creaton-io/creaton?ref=homepage"><svg width="24" height="24" className=" transform scale-150" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a></div>
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12"><a href="https://twitter.com/creaton_io"><svg width="24" height="24" className="fill-current text-light-blue-400 transform scale-150" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a></div>
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12"><a href="https://discord.gg/pPMk9bcarf"><svg width="24" height="24" className="fill-current text-indigo-400 transform scale-150" fill-rule="evenodd" clip-rule="evenodd"><path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z"/></svg></a></div>
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12"><a href="https://t.me/creaton_io"><svg width="24" height="24" className="fill-current text-light-blue-500 transform scale-150" fill-ule="evenodd" stroke-linejoin= "round" stroke-miterlimit="1.41421" clip-rule="evenodd"><path id="telegram-1" d="M18.384,22.779c0.322,0.228 0.737,0.285 1.107,0.145c0.37,-0.141 0.642,-0.457 0.724,-0.84c0.869,-4.084 2.977,-14.421 3.768,-18.136c0.06,-0.28 -0.04,-0.571 -0.26,-0.758c-0.22,-0.187 -0.525,-0.241 -0.797,-0.14c-4.193,1.552 -17.106,6.397 -22.384,8.35c-0.335,0.124 -0.553,0.446 -0.542,0.799c0.012,0.354 0.25,0.661 0.593,0.764c2.367,0.708 5.474,1.693 5.474,1.693c0,0 1.452,4.385 2.209,6.615c0.095,0.28 0.314,0.5 0.603,0.576c0.288,0.075 0.596,-0.004 0.811,-0.207c1.216,-1.148 3.096,-2.923 3.096,-2.923c0,0 3.572,2.619 5.598,4.062Zm-11.01,-8.677l1.679,5.538l0.373,-3.507c0,0 6.487,-5.851 10.185,-9.186c0.108,-0.098 0.123,-0.262 0.033,-0.377c-0.089,-0.115 -0.253,-0.142 -0.376,-0.064c-4.286,2.737 -11.894,7.596 -11.894,7.596Z"/></svg></a></div>
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12"><a href="https://medium.com/creaton"><svg width="24" height="24" className="transform scale-150" fill-rule="evenodd" clip-rule="evenodd"><path d="M2.846 6.887c.03-.295-.083-.586-.303-.784l-2.24-2.7v-.403h6.958l5.378 11.795 4.728-11.795h6.633v.403l-1.916 1.837c-.165.126-.247.333-.213.538v13.498c-.034.204.048.411.213.537l1.871 1.837v.403h-9.412v-.403l1.939-1.882c.19-.19.19-.246.19-.537v-10.91l-5.389 13.688h-.728l-6.275-13.688v9.174c-.052.385.076.774.347 1.052l2.521 3.058v.404h-7.148v-.404l2.521-3.058c.27-.279.39-.67.325-1.052v-10.608z"/></svg></a></div>
                  </div>
                </div>
              </div>
                <span className="flex lg:hidden justify-center relative object-cover pattern overflow-hidden">
                   <div className="relative block lg:hidden">
                    <div className="max-w-full px-4 py-4 mx-auto bg-fixed" background-image="url(https://static.shuffle.dev/uploads/files/c9/c9d217321b054bd84b6eb32c4472c67a9ff8a86b/pngtree-camouflage-gradient-background-color-mixing-apple-wind-image-34341.jpg)">
                      <div className="max-w-lg mx-auto grid gap-5 lg:max-w-none">
                        <div className="flex flex-col rounded-2xl border p-8 overflow-hidden bg-white">
                          <div className="flex-1 bg-white flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <div className="flex-shrink-0">
                                <a href="#"><img className="h-8 w-8 rounded-full object-cover" src="https://arweave.net/BhAz8CXTxUVM0h0tLQ-bF_nnjEkDpwrjRg--DFL2AXc" alt="avatar" /></a>
                              </div>
                              <div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 my-6"><img className="h-72 w-80 object-cover filter blur-sm" src="https://arweave.net/MwkwnM2Hh65SM2JtGVCjYbpAO_-ONFpqT17_mEfirtI" /></div>
                          <div>
                            <div className="flex justify-between items-center">
                              <h4 className="text-lg font-semibold text-gray-900">Alexander</h4>
                              ❤️
                            </div>
                            <div><span className="text-xs">Subscribe for</span><span className="font-semibold text-blue ml-2">$6</span></div>
                          </div>
                        </div>
                      </div>
                    </div> 
                  </div>
                 </span>
              <div className="lg:absolute lg:w-2/3 lg:bottom-0 lg:right-0 flex flex-wrap items-center justify-center pl-2 lg:-ml-36">
                <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2 mt-8 mb-6"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 transform scale-75" src="/static/images/logo-polygon.png" alt="" /></div>
                <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2 mt-8 mb-6"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75" src="/static/images/brand-2.png" alt="" /></div>
                <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2 mt-8 mb-6"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 lg:pl-4" src="/static/images/brand-5.png" alt="" /></div>
                <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2 mt-8 mb-6"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 transform scale-50" src="/static/images/brand-3.png" alt="" /></div>
                <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2 mt-8 mb-6"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 transform scale-75 lg:-ml-8" src="/static/images/brand-7.png" alt="" /></div>
                <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2 mt-8 mb-6"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 lg:-ml-8" src="/static/images/logo-chainlink.png" alt="" /></div>
              </div>
              <div className="hidden navbar-menu relative z-50">
                <div className="navbar-backdrop fixed inset-0 bg-gray-800 opacity-25"></div>
                <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-white border-r overflow-y-auto">
                  <div className="flex items-center mb-8">
                    <a className="mr-auto text-lg font-semibold leading-none" href="#"><img src="https://static.shuffle.dev/uploads/files/c9/c9d217321b054bd84b6eb32c4472c67a9ff8a86b/HQ2.png" alt="Creaton" width="150" /></a>
                    <button className="navbar-close">
                      <svg className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <div>
                    <ul>
                      <li className="mb-1"><a className="block p-4 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded" href="#">Telegram</a></li>
                      <li className="mb-1"><a className="block p-4 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded" href="#">Github</a></li>
                      <li className="mb-1"><a className="block p-4 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded" href="#">Twitter</a></li>
                      <li className="mb-1"><a className="block p-4 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded" href="#">Discord</a></li>
                    </ul>
                  </div>
                  <div className="mt-auto">
                    <div className="pt-6"><a className="block py-3 text-center text-sm leading-normal bg-red-50 hover:bg-red-100 text-red-300 font-semibold rounded transition duration-200" href="mailto:contact@creaton.io">Contact Us</a></div>
                    <p className="mt-6 mb-4 text-sm text-center text-gray-500">
                      <span>© 2021 All rights reserved.</span>
                    </p>
                  </div>
                </nav>
              </div>
            </main>
          </div>
        </div>
        <div className="max-w-7xl flex mx-auto py-32 px-28">
            <div className="flex flex-1 items-center justify-center"><img src="/assets/svgs/section-1.svg"/></div>
            <div className="flex-1 flex flex-col justify-center px-4">
                <h1 className="text-4xl mb-12 font-semibold">Create exclusive content for subscribers</h1>
                <div className="flex w-full">
                    <div className="flex-1">
                        <img src="/assets/svgs/earn-money.svg"/>
                        <h3 className="text-lg font-bold mt-8 mb-4">No waiting for your check!</h3>
                        <div className="whitespace-pre-line">Earn real-time (every second) streaming income for creating exclusive content
                      </div>
                    </div>
                    <div className="flex-1">
                        <img src="/assets/svgs/tokenize.svg"/>
                        <h3 className="text-lg font-bold mt-8 mb-4">NFT your creations</h3>
                        <div className="whitespace-pre-line">Be the owner of your content, forever and everywhere in the Ether</div>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-grey">
            <div className="max-w-7xl px-32 py-28 flex mx-auto">
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-4xl mb-12 font-semibold">Get access to memberships, content and perks</h1>
                    <div className="flex w-full">
                        <div className="flex-1">
                            <img src="/assets/svgs/eye.svg"/>
                            <h3 className="text-lg font-bold mt-8 mb-4">Membership content</h3>
                            <div className="whitespace-pre-line">Get access to content, premieres and events as long as you subscribe!</div>
                        </div>
                        <div className="flex-1">
                            <img src="/assets/svgs/star.svg"/>
                            <h3 className="text-lg font-bold mt-8 mb-4">Level up your fan status</h3>
                            <div className="whitespace-pre-line">Get rewarded by creators for holding NFT's that display your level of commitment!</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-center"><img src="/assets/svgs/section-2.svg"/></div>
            </div>
        </div>
        <div className="max-w-7xl px-32 py-28 mx-auto">
            <h3 className="text-4xl font-bold">Creators spotlight</h3>
            <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
                <div className="flex flex-col rounded-2xl border p-8 overflow-hidden">
                    <div className="flex-1 bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0"><a href="#"><img className="h-8 w-8 rounded-full" src="/assets/svgs/default-avatar.svg" alt="2bts"/></a></div>
                            <div>
                                <button type="button" className="w-8 h-8 rounded-full inline-flex items-center justify-center border focus:outline-none">
                                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ellipsis-h" className="svg-inline--fa fa-ellipsis-h fa-w-16 fa-xs text-black" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path fill="currentColor" d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 my-6"><img className="h-72 w-72 object-cover rounded-xl" src="https://s3-alpha-sig.figma.com/img/944b/97f8/41910ef4b801de0e2f07219ec965d924?Expires=1617580800&amp;Signature=F88OzDa4J9vSa4j6obe6SQ6hoIDRr7Pl2C3s7GXiznekk9fQOhqzjjLLB2dDP~-evyvTw4CgKQmq4TQ34TEdzPXrwqcBD7okHK1xPc14Es8i0ycPbck-DUVttWFbzrbgXRP33kt399l7gP5mySfmeujCxVp-nGzPj2xEgTybeV3emn6nJSql70HQEYpyTkYS7UPi0R6TIi9A84zgB5nLRWH-uBChYzl~uGBQBR3LQdSunr7CbTA6M1j0F~9EaEEV8-LCCucP6LvTZQCgWSyF1bfh5GrBgFNXdkMV6N1PtyBNYq7PkyJQrcNtJJKnCOF495m~ESeLCE3OZO0IVChBpQ__&amp;Key-Pair-Id=APKAINTVSUGEWH5XD5UA"/></div>
                    <div>
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-900">2bts</h4>
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart" className="svg-inline--fa fa-heart fa-w-16 text-grey-dark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path>
                            </svg>
                        </div>
                        <div><span className="text-xs">Subscribe for</span><span className="font-semibold text-blue ml-2">$1</span></div>
                    </div>
                </div>
                <div className="flex flex-col rounded-2xl border p-8 overflow-hidden">
                    <div className="flex-1 bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0"><a href="#"><img className="h-8 w-8 rounded-full" src="/assets/svgs/default-avatar.svg" alt="React-test"/></a></div>
                            <div>
                                <button type="button" className="w-8 h-8 rounded-full inline-flex items-center justify-center border focus:outline-none">
                                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ellipsis-h" className="svg-inline--fa fa-ellipsis-h fa-w-16 fa-xs text-black" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path fill="currentColor" d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 my-6"><img className="h-72 w-72 object-cover rounded-xl" src="https://s3-alpha-sig.figma.com/img/77bc/9534/335baac00d71069f7da4a9b0deb71f5b?Expires=1617580800&amp;Signature=J2VBaWj~czQJYjMsg5-KJtd3L9nVHJxhVSeAY-2Rsezz9rSZTL48vpHm9-AQmH0S-sNP6dTv0s75Lq4vm6oDsNoPUXz3I-sz8hddTddlaLqvdcxprlhhTqg2c4~4hNUqXoyQZPoBcaoAy4vy4Ezy4eKhqWlpYSQ8~1CnblLP266aOswe~BpkDj7ZruWiAjWWn0johu92ikSx8-C-GdKwKOG3cfudTdcCoV4sangFYXc3Q93HgEUY3d23xdYNidsTo47gULfz027ITU6q4CFsFvtY7bG~5z02YsGHT8W-M-N~~uDP-7eohmunXS4iztS4oFpIVoDA921H4CzkJQvj6Q__&amp;Key-Pair-Id=APKAINTVSUGEWH5XD5UA"/></div>
                    <div>
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-900">React-test</h4>
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart" className="svg-inline--fa fa-heart fa-w-16 text-grey-dark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path>
                            </svg>
                        </div>
                        <div><span className="text-xs">Subscribe for</span><span className="font-semibold text-blue ml-2">$1</span></div>
                    </div>
                </div>
                <div className="flex flex-col rounded-2xl border p-8 overflow-hidden">
                    <div className="flex-1 bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0"><a href="#"><img className="h-8 w-8 rounded-full" src="/assets/svgs/default-avatar.svg" alt="check"/></a></div>
                            <div>
                                <button type="button" className="w-8 h-8 rounded-full inline-flex items-center justify-center border focus:outline-none">
                                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ellipsis-h" className="svg-inline--fa fa-ellipsis-h fa-w-16 fa-xs text-black" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path fill="currentColor" d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 my-6"><img className="h-72 w-72 object-cover rounded-xl" src="https://s3-alpha-sig.figma.com/img/9eb4/9bb1/4d10c6df41ae11ca64f38fd458dad73c?Expires=1617580800&amp;Signature=R075W0Ia~PIwTiDM-xk5P7OlAngdQgshqhM7bqhG0kErKnJOysPKDU6oxGE2f~UVqk7fI6UslvkqPw0Z6QZCOojqTR9rlAj6n3XoyPIXkQ1i3VtfWhgsGik5uZDbKRftDOQV4Te5TJmLp5SuGkfgPXl3UcHjtnzP9N25nzZLZqmlZMYpISWz36Op6GEyRigfWrwW2naaJecr-sttPCXP9HRS33xB~9rcsv0-v2yoC50OSiOO-XopYSK3-fyBhUwJyKHt3BYgpftvEsdL9CtuMpHQA2SvioHxCs9XUSTKZjnRqmlWUiNdgiAJKkDRmm7dIIj947enJsP3sCoSNt2l6g__&amp;Key-Pair-Id=APKAINTVSUGEWH5XD5UA"/></div>
                    <div>
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-900">check</h4>
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart" className="svg-inline--fa fa-heart fa-w-16 text-grey-dark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path>
                            </svg>
                        </div>
                        <div><span className="text-xs">Subscribe for</span><span className="font-semibold text-blue ml-2">$1</span></div>
                    </div>
                </div>
                <div className="flex flex-col rounded-2xl border p-8 overflow-hidden">
                    <div className="flex-1 bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0"><a href="#"><img className="h-8 w-8 rounded-full" src="/assets/svgs/default-avatar.svg" alt="Test"/></a></div>
                            <div>
                                <button type="button" className="w-8 h-8 rounded-full inline-flex items-center justify-center border focus:outline-none">
                                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ellipsis-h" className="svg-inline--fa fa-ellipsis-h fa-w-16 fa-xs text-black" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path fill="currentColor" d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 my-6"><img className="h-72 w-72 object-cover rounded-xl" src="https://s3-alpha-sig.figma.com/img/b298/116b/7a87f15ab77a011baee92961483040ea?Expires=1617580800&amp;Signature=QDxVAPs7GfEf~9ZoqhdsnCTxjDEYS3FIrINNSj2wALvdwnBMqEOw4WTtWg9iDCzrdoBHD5ZpK-Ad2Wo91mM5dCH70pNKvkz-OB4IieDeqOWtairhfTvp6lY4xt746DySCBLR111gCDcQbn1G1rTOmhLo8wwg946EBqmI-UdEPmS~cGUr-4zZ73OmfYjgy8wbcgrZXeXEg-R~wC4MdG17cF8DhUIvLXuMyTcbpLao2IGDBypZ0iJlrWaN~-9jnHcKrji1EQq78tjBV412oRFvGQiqdOIbA8xXPTU8NhTTFUCscAV7ybVRk0u-Ncg~0rmfB7lmaEaRq1g8wYnF9Pxrgw__&amp;Key-Pair-Id=APKAINTVSUGEWH5XD5UA"/></div>
                    <div>
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-900">Test</h4>
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart" className="svg-inline--fa fa-heart fa-w-16 text-grey-dark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path>
                            </svg>
                        </div>
                        <div><span className="text-xs">Subscribe for</span><span className="font-semibold text-blue ml-2">$1</span></div>
                    </div>
                </div>
                <div className="flex flex-col rounded-2xl border p-8 overflow-hidden">
                    <div className="flex-1 bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0"><a href="#"><img className="h-8 w-8 rounded-full" src="/assets/svgs/default-avatar.svg" alt="Cryptosaurus"/></a></div>
                            <div>
                                <button type="button" className="w-8 h-8 rounded-full inline-flex items-center justify-center border focus:outline-none">
                                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ellipsis-h" className="svg-inline--fa fa-ellipsis-h fa-w-16 fa-xs text-black" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path fill="currentColor" d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 my-6"><img className="h-72 w-72 object-cover rounded-xl" src="https://s3-alpha-sig.figma.com/img/d5e5/044f/1e61f56acb02d8f8c9095a831a8cb9f8?Expires=1617580800&amp;Signature=XoQ9sMhM-nDppSwlUH1Z4JhJjG4tFl1sO5wC0cTepl8m7ND8WimItkZOPkXiwj4iAfxeZzMcve9luaiykF~9tWRrrv3nzs1IUkq2V1WniLWVWecRa9~JmPhltH5ujBNtNszu3rSwn-yl-VrvLmNqHxeAJ6IYVr7hGAcK0bN6liEeP5UAtRIkzhmuP8hrPysN~ozsmLBXyc4GHQUw1ggb3EgmdBEBuzcBPo4XzdC1NmWVHmohH0K1SI1dmygPjSaV8U0~B6eVIUoT411NHHRaqGI63U0Bw9bi2HKNJunJ5MKZtvFE4PUA78PAsN25yPeIwDJd5SbMvmkXSVrewgTgFg__&amp;Key-Pair-Id=APKAINTVSUGEWH5XD5UA"/></div>
                    <div>
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-900">Cryptosaurus</h4>
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart" className="svg-inline--fa fa-heart fa-w-16 text-grey-dark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path>
                            </svg>
                        </div>
                        <div><span className="text-xs">Subscribe for</span><span className="font-semibold text-blue ml-2">$1</span></div>
                    </div>
                </div>
                <div className="flex flex-col rounded-2xl border p-8 overflow-hidden">
                    <div className="flex-1 bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0"><a href="#"><img className="h-8 w-8 rounded-full" src="/assets/svgs/default-avatar.svg" alt="test"/></a></div>
                            <div>
                                <button type="button" className="w-8 h-8 rounded-full inline-flex items-center justify-center border focus:outline-none">
                                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ellipsis-h" className="svg-inline--fa fa-ellipsis-h fa-w-16 fa-xs text-black" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path fill="currentColor" d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 my-6"><img className="h-72 w-72 object-cover rounded-xl" src="https://s3-alpha-sig.figma.com/img/7944/f1e2/d8acf8de59e9e654570b2f4d87e8d8eb?Expires=1617580800&amp;Signature=YedOyRjE63as0VHmlKcgwoK9-fm8KeCyOYLVh1tMTX0JQQchc~bY5FPZ9~B-YbuWT9-YKm2YtPdEgDIkN3HBw9gEQGSPHeXmywx4qgKKeFUGely85K0hRhv51OG2iF-ulTO4Mvzp2kCevu1PhxgLIfMivDElzLKfq45a4Yv77XLK7mDePQeU4lZ2HS3Ow1~E~G2JWEMJF1ceMSnCu8iXcWf6Ccyu5RIPa2eNCwswCPt3lV17za7yUZT3oMR0rg8Kg6xhv0wNdSRRRudIq4RmN-Oea6MCMsAZ3mz3gaAtrHP2gzn-2D4pj2VGCLujIx3k3Z2C6Nmz6xTt5EnJ4kHsYg__&amp;Key-Pair-Id=APKAINTVSUGEWH5XD5UA"/></div>
                    <div>
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-900">test</h4>
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart" className="svg-inline--fa fa-heart fa-w-16 text-grey-dark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path>
                            </svg>
                        </div>
                        <div><span className="text-xs">Subscribe for</span><span className="font-semibold text-blue ml-2">$1</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-black text-white invisible">
            <div className="max-w-7xl flex mx-auto py-32 px-28">
                <div className="flex flex-1 items-center justify-center"><img src="/assets/svgs/section-4.svg"/></div>
                <div className="flex-1 flex flex-col justify-center px-4">
                    <h1 className="text-4xl mb-12 font-semibold">Be the owner of your content (yes, you never owned yours)</h1>
                    <div className="flex w-full">
                        <div className="flex-1">
                            <img src="/assets/svgs/empty.svg"/>
                            <h3 className="text-lg font-bold mt-8 mb-4">Take your work everywhere in the Ether</h3>
                            <div className="whitespace-pre-line">Wherever you go, you own your content in the shape of a NFT. Go where you're treated best! But we will try our best ;) </div>
                        </div>
                        <div className="flex-1">
                            <img src="/assets/svgs/empty.svg"/>
                            <h3 className="text-lg font-bold mt-8 mb-4">Can't be taken down!</h3>
                            <div className="whitespace-pre-line">You won't have to worry about us taking you down with the platform like Vine, as Creaton is ownership-driven </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="max-w-7xl px-32 py-28 mx-auto text-center w-3/4 invisible">
            <h1 className="text-4xl font-semibold">Could delete this section</h1>
            <div className="whitespace-pre-line my-10">
                <div>Legacy social media platforms store your content unencrypted </div>
                <div>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
            </div>
            <a href="#" className="px-6 py-3 rounded-full text-white bg-blue border-blue border border-solid">Join the race</a>
            <div className="mt-12"><img src="/assets/images/section-5.png" className="mx-auto" width="768" height="631"/></div>
        </div>
        <div className="bg-grey">
            <div className="max-w-7xl flex mx-auto py-32 px-28">
                <div className="flex flex-1 items-center justify-center"><img src="/assets/svgs/section-6.svg"/></div>
                <div className="flex-1 flex flex-col justify-center px-4">
                    <h1 className="text-4xl mb-12 font-semibold">Delete this too unless there can be a better graphic</h1>
                    <div className="flex w-full">
                        <div className="flex-1">
                            <img src="/assets/svgs/empty.svg"/>
                            <h3 className="text-lg font-bold mt-8 mb-4">Lorem ipsum dolor</h3>
                            <div className="whitespace-pre-line">Lorem ipsum dolor sit amet, consectetur </div>
                        </div>
                        <div className="flex-1">
                            <img src="/assets/svgs/empty.svg"/>
                            <h3 className="text-lg font-bold mt-8 mb-4">Lorem ipsum</h3>
                            <div className="whitespace-pre-line">Lorem ipsum dolor sit amet, consectetur adipiscing elit</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto py-32 px-28 relative">
            <img src="/assets/svgs/section-7.svg" className="absolute top-0 right-0"/>
            <h1 className="text-4xl mb-12 font-semibold">Partners &amp; Investors</h1>
            <div className="flex items-center"><img src="/assets/images/brand-3.png" width="168" height="77.15"/><img src="/assets/images/brand-1.png" width="168" height="77.15"/></div>
            <h1 className="text-4xl mt-24 mb-12 font-semibold">Technologies</h1>
            <div className="flex justify-between items-center"><img src="/assets/images/brand-2.png" width="168" height="77.15"/><img src="/assets/images/brand-3.png" width="168" height="77.15"/><img src="/assets/images/brand-4.png" width="168" height="77.15"/><img src="/assets/images/brand-5.png" width="168" height="77.15"/><img src="/assets/images/brand-6.png" width="168" height="77.15"/><img src="/assets/images/brand-7.png" width="168" height="77.15"/></div>
        </div>
        <div className="py-16 px-28 bg-black">
            <div className="max-w-7xl mx-auto">
                <h3 className="text-2xl text-white font-bold">Keep updated on our progress!</h3>
                <div className="flex mt-4 items-end">
                    <div className="border-solid border-grey rounded-full border flex"><input placeholder="Email address" className="bg-transparent focus:outline-none ml-4 text-white"/><a href="#" className="px-4 py-2 rounded-full text-white bg-blue border-blue border border-solid">Join the race</a></div>
                    <div className="flex ml-auto space-x-4"><img src="/assets/svgs/twitter.svg"/><img src="/assets/svgs/github.svg"/><img src="/assets/svgs/medium.svg"/><img src="/assets/svgs/telegram.svg"/></div>
                </div>
            </div>
        </div>
      </div>
  );
}

export {CREATORS_QUERY};
export default Home;
