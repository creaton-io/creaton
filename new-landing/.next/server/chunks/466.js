"use strict";
exports.id = 466;
exports.ids = [466];
exports.modules = {

/***/ 1466:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ MainLayout)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
// EXTERNAL MODULE: ./src/layout/Meta.tsx
var Meta = __webpack_require__(9775);
// EXTERNAL MODULE: ./src/utils/AppConfig.ts
var AppConfig = __webpack_require__(1305);
// EXTERNAL MODULE: external "next/router"
var router_ = __webpack_require__(1853);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1664);
// EXTERNAL MODULE: external "react-switch"
var external_react_switch_ = __webpack_require__(8248);
var external_react_switch_default = /*#__PURE__*/__webpack_require__.n(external_react_switch_);
// EXTERNAL MODULE: ./src/components/background/Background.tsx
var Background = __webpack_require__(6247);
// EXTERNAL MODULE: ./src/components/navigation/NavbarTwoColumns.tsx
var NavbarTwoColumns = __webpack_require__(8285);
// EXTERNAL MODULE: ./src/templates/Logo.tsx
var Logo = __webpack_require__(2160);
// EXTERNAL MODULE: ./src/components/button/Button.tsx
var Button = __webpack_require__(7173);
// EXTERNAL MODULE: external "react-icons/fa"
var fa_ = __webpack_require__(6290);
;// CONCATENATED MODULE: ./src/layout/mainHeader.tsx










function MainHeader(props) {
    const { 0: themeChecked , 1: setThemeChecked  } = (0,external_react_.useState)(false);
    const { 0: isOpen , 1: setIsOpen  } = (0,external_react_.useState)(false);
    const router = (0,router_.useRouter)();
    const items = [
        {
            data: '2900 USDCx',
            icon: 'usdc.png',
            tip: true
        },
        {
            data: '2900 USDC',
            icon: 'usdc.png',
            tip: false
        },
        {
            data: '10 MATIC',
            icon: 'matic.png',
            tip: false
        }
    ];
    const handleThemeChange = (checked)=>{
        setThemeChecked(checked);
        props.handleSwitch();
    };
    const toggling = ()=>setIsOpen(!isOpen)
    ;
    return(/*#__PURE__*/ jsx_runtime_.jsx(Background/* Background */.A, {
        color: "bg-transparent w-full",
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
            className: "container flex justify-between py-2 mx-auto",
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx(NavbarTwoColumns/* NavbarTwoColumns */.g, {
                    theme: props.theme,
                    logo: /*#__PURE__*/ jsx_runtime_.jsx(Logo/* Logo */.T, {
                        theme: props.theme,
                        xl: true
                    })
                }),
                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                    className: "flex items-center",
                    children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "max-w-md mx-auto flex items-center partner-container",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx(next_link["default"], {
                                href: "/subscribers",
                                children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                    className: `ml-5 font-bold text-sm ${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} ${router.pathname === '/subscribers' ? 'active relative' : ''}`,
                                    children: "Subscribers"
                                })
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx(Button/* Button */.z, {
                                link: "/upload",
                                title: "Upload",
                                class: "mx-5",
                                icon: /*#__PURE__*/ jsx_runtime_.jsx(fa_.FaArrowUp, {
                                })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "flex flex-col items-end relative",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: "flex w-fit my-2 address-wrapper rounded-full p-1.5 items-center cursor-pointer invisible",
                                        onClick: toggling,
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("p", {
                                                className: `${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-xs px-2 font-bold`,
                                                children: "0x89021...28931"
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("img", {
                                                src: `${router.basePath}/assets/images/avatar.png`,
                                                alt: 'Avatar'
                                            })
                                        ]
                                    }),
                                    isOpen && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: `${props.theme === 'dark' ? 'bg-main-100' : 'bg-white'} rounded-lg w-52 border-gray-400 border-solid border px-3 py-3 absolute top-14 z-10`,
                                        children: [
                                            items.map((item, index)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                                    className: "flex py-1.5 cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ jsx_runtime_.jsx("img", {
                                                            className: "w-10 h-10",
                                                            src: `${router.basePath}/assets/images/${item.icon}`,
                                                            alt: 'Icon'
                                                        }),
                                                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                                            className: "flex flex-col pl-2",
                                                            children: [
                                                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                                    className: "text-gray-500 text-sm",
                                                                    children: "Balance"
                                                                }),
                                                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                                    className: `${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'} text-sm font-bold`,
                                                                    children: item.data
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, index)
                                            ),
                                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                                className: "flex justify-between pt-2 border-t border-solid border-gray-400 mt-1.5",
                                                children: [
                                                    /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                        className: `${props.theme === 'dark' ? 'text-white' : 'text-indigo-900'}`,
                                                        children: "Theme"
                                                    }),
                                                    /*#__PURE__*/ jsx_runtime_.jsx((external_react_switch_default()), {
                                                        onChange: handleThemeChange,
                                                        checked: themeChecked,
                                                        onColor: "#312880",
                                                        offColor: "#F6F5FD",
                                                        onHandleColor: "#FFFFFF",
                                                        offHandleColor: "#6A6781",
                                                        width: 50,
                                                        height: 26,
                                                        checkedIcon: false,
                                                        uncheckedIcon: false
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                })
            ]
        })
    }));
};


;// CONCATENATED MODULE: ./src/layout/MainLayout.tsx





function MainLayout(props) {
    return(/*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: `${props.theme === 'light' ? 'bg-white' : 'bg-main-100'}`,
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(MainHeader, {
                theme: props.theme,
                handleSwitch: props.handleSwitch
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "w-full content-wrapper",
                children: /*#__PURE__*/ jsx_runtime_.jsx("main", {
                    className: "w-full",
                    children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "antialiased text-gray-600 h-full",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx(Meta/* Meta */.h, {
                                title: AppConfig/* AppConfig.title */.X.title,
                                description: AppConfig/* AppConfig.description */.X.description
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "w-full items-center h-full",
                                children: props.children
                            })
                        ]
                    })
                })
            })
        ]
    }));
};


/***/ })

};
;