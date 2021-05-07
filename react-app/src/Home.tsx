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
        <div className="relative h-screen bg-white overflow-hidden z-40">
          <div className="relative h-screen -mt-12 pt-1 homepage-wrapper">
            <main>
              <div>
                <img className="hidden lg:block absolute top-0 left-0 w-1/3 h-full object-cover rounded-br-lg" src="https://static.shuffle.dev/uploads/files/c9/c9d217321b054bd84b6eb32c4472c67a9ff8a86b/pngtree-camouflage-gradient-background-color-mixing-apple-wind-image-34341.jpg" alt=""/>
                <span className="hidden lg:flex justify-center absolute -mt-12 top-24 clip-24 left-0 w-1/3 h-full object-cover pattern overflow-hidden">
                  <div className="absolute hidden lg:block ">
                    <div className="max-w-full px-4 py-4 mx-auto">
                      <div className="mt-16 max-w-lg mx-auto grid gap-5 lg:max-w-none">
                        <div className="flex flex-col rounded-2xl border p-8 bg-white">
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
                  <div className="mt-10 lg:mt-32 max-w-2xl lg:pr-10 margin-overwrite">
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
                    <a
                      className="block w-full md:w-auto text-center mb-2 py-4 px-8 md:mr-4 text-sm text-white font-medium leading-normal rounded transition duration-200 to-indigo-700 bg-gradient-to-l from-indigo-500 hover:from-indigo-400 hover:to-indigo-600"
                      href="https://discord.gg/pPMk9bcarf">Join Discord to get in the waitlist!</a>
                  <a className="block w-full md:w-auto text-center mb-2 py-4 px-8 text-sm font-medium rounded border border-indigo-700 hover:border-black hover:bg-gray-100 transition duration-200" href="https://medium.com/creaton/creaton-our-mission-a07a658a92b3">Learn More</a>
                  </div>
                  <div className="flex flex-wrap items-center justify-center lg:w-96">
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12 z-10"><a
                      href="https://github.com/creaton-io/creaton?ref=homepage">
                      <svg width="24" height="24" className=" transform scale-150" viewBox="0 0 24 24">
                        <path
                          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a></div>
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12 z-10"><a
                      href="https://twitter.com/creaton_io">
                      <svg width="24" height="24" className="fill-current text-blue-400 transform scale-150"
                           viewBox="0 0 24 24">
                        <path
                          d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </a></div>
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12 z-10"><a
                      href="https://discord.gg/pPMk9bcarf">
                      <svg width="24" height="24" className="fill-current text-indigo-400 transform scale-150"
                           fillRule="evenodd" clipRule="evenodd">
                        <path
                          d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z"/>
                      </svg>
                    </a></div>
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12 z-10"><a
                      href="https://t.me/creaton_io">
                      <svg width="24" height="24" className="fill-current text-green-500 transform scale-150"
                           fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="1.41421" clipRule="evenodd">
                        <path id="telegram-1"
                              d="M18.384,22.779c0.322,0.228 0.737,0.285 1.107,0.145c0.37,-0.141 0.642,-0.457 0.724,-0.84c0.869,-4.084 2.977,-14.421 3.768,-18.136c0.06,-0.28 -0.04,-0.571 -0.26,-0.758c-0.22,-0.187 -0.525,-0.241 -0.797,-0.14c-4.193,1.552 -17.106,6.397 -22.384,8.35c-0.335,0.124 -0.553,0.446 -0.542,0.799c0.012,0.354 0.25,0.661 0.593,0.764c2.367,0.708 5.474,1.693 5.474,1.693c0,0 1.452,4.385 2.209,6.615c0.095,0.28 0.314,0.5 0.603,0.576c0.288,0.075 0.596,-0.004 0.811,-0.207c1.216,-1.148 3.096,-2.923 3.096,-2.923c0,0 3.572,2.619 5.598,4.062Zm-11.01,-8.677l1.679,5.538l0.373,-3.507c0,0 6.487,-5.851 10.185,-9.186c0.108,-0.098 0.123,-0.262 0.033,-0.377c-0.089,-0.115 -0.253,-0.142 -0.376,-0.064c-4.286,2.737 -11.894,7.596 -11.894,7.596Z"/>
                      </svg>
                    </a></div>
                    <div className="flex lg:flex-none justify-center lg:justify-start w-1/5 px-2 mb-12 z-10"><a
                      href="https://medium.com/creaton">
                      <svg width="24" height="24" className="transform scale-150" fillRule="evenodd" clipRule="evenodd">
                        <path
                          d="M2.846 6.887c.03-.295-.083-.586-.303-.784l-2.24-2.7v-.403h6.958l5.378 11.795 4.728-11.795h6.633v.403l-1.916 1.837c-.165.126-.247.333-.213.538v13.498c-.034.204.048.411.213.537l1.871 1.837v.403h-9.412v-.403l1.939-1.882c.19-.19.19-.246.19-.537v-10.91l-5.389 13.688h-.728l-6.275-13.688v9.174c-.052.385.076.774.347 1.052l2.521 3.058v.404h-7.148v-.404l2.521-3.058c.27-.279.39-.67.325-1.052v-10.608z"/>
                      </svg>
                    </a></div>
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
            </main>
            <div className="lg:absolute lg:w-2/3 lg:bottom-0 lg:right-0 flex flow-row flex-wrap items-center justify-center pl-2 lg:-ml-36">
              <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 transform scale-75" src="./assets/images/logo-polygon.png" alt="" /></div>
              <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75" src="./assets/images/brand-2.png" alt="" /></div>
              <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 lg:pl-4" src="./assets/images/brand-5.png" alt="" /></div>
              <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 transform scale-50" src="./assets/images/brand-3.png" alt="" /></div>
              <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 transform scale-75 lg:-ml-8" src="./assets/images/brand-7.png" alt="" /></div>
              <div className="w-1/2 md:w-1/3 lg:w-1/6 px-2"><img className="mx-auto lg:mx-0 filter grayscale contrast-0 opacity-75 lg:-ml-8" src="./assets/images/logo-chainlink.png" alt="" /></div>
            </div>
          </div>
        </div>
  );
}

export {CREATORS_QUERY};
export default Home;
