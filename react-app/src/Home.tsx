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

function Home() {
  return (
    <div>
        <div className="relative bg-black overflow-hidden">
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
                <main className="mx-auto max-w-7xl px-4">
                    <div className="text-left">
                        <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl"><span className="block">Web3 Subscriptions</span><span className="block">for Encrypted Content</span></h1>
                        <div className="mt-5 max-w-md sm:flex md:mt-8">
                            <div className="mt-3 rounded-md shadow sm:mt-0"><a href="#" className="px-4 py-2 rounded-full text-white bg-blue border-blue border border-solid">Join the new Creator Economy</a></div>
                        </div>
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
