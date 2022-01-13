"use strict";
exports.id = 453;
exports.ids = [453];
exports.modules = {

/***/ 3453:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ Layout)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
// EXTERNAL MODULE: ./src/layout/Meta.tsx
var Meta = __webpack_require__(9775);
// EXTERNAL MODULE: ./src/utils/AppConfig.ts
var AppConfig = __webpack_require__(1305);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1664);
// EXTERNAL MODULE: ./src/components/background/Background.tsx
var Background = __webpack_require__(6247);
;// CONCATENATED MODULE: ./src/layout/Section.tsx

const Section = (props)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: `container mx-auto px-3 ${props.yPadding ? props.yPadding : 'py-16'}`,
        children: [
            (props.title || props.description) && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "mb-12 text-center",
                children: [
                    props.title && /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                        className: "text-4xl text-gray-900 font-bold",
                        children: props.title
                    }),
                    props.description && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: "mt-4 text-xl md:px-20",
                        children: props.description
                    })
                ]
            }),
            props.children
        ]
    })
;


// EXTERNAL MODULE: external "react-icons/si"
var si_ = __webpack_require__(764);
// EXTERNAL MODULE: external "react-icons/fa"
var fa_ = __webpack_require__(6290);
;// CONCATENATED MODULE: ./src/templates/Footer.tsx






const Footer = ()=>/*#__PURE__*/ jsx_runtime_.jsx(Background/* Background */.A, {
        color: "footer-container bg-transparent w-full max-w-md mx-auto w-full",
        children: /*#__PURE__*/ jsx_runtime_.jsx(Section, {
            yPadding: "py-12",
            children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("ul", {
                className: "flex justify-end",
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("li", {
                        className: "ml-6",
                        children: /*#__PURE__*/ jsx_runtime_.jsx(next_link["default"], {
                            href: "/",
                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                children: /*#__PURE__*/ jsx_runtime_.jsx(si_.SiGmail, {
                                    size: "20px",
                                    fill: "#312880"
                                })
                            })
                        })
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("li", {
                        className: "ml-6",
                        children: /*#__PURE__*/ jsx_runtime_.jsx(next_link["default"], {
                            href: "/",
                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                children: /*#__PURE__*/ jsx_runtime_.jsx(fa_.FaTwitter, {
                                    size: "20px",
                                    fill: "#312880"
                                })
                            })
                        })
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("li", {
                        className: "ml-6",
                        children: /*#__PURE__*/ jsx_runtime_.jsx(next_link["default"], {
                            href: "/",
                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                children: /*#__PURE__*/ jsx_runtime_.jsx(fa_.FaDiscord, {
                                    size: "20px",
                                    fill: "#312880"
                                })
                            })
                        })
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("li", {
                        className: "ml-6",
                        children: /*#__PURE__*/ jsx_runtime_.jsx(next_link["default"], {
                            href: "/",
                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                children: /*#__PURE__*/ jsx_runtime_.jsx(fa_.FaTelegramPlane, {
                                    size: "20px",
                                    fill: "#312880"
                                })
                            })
                        })
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("li", {
                        className: "ml-6",
                        children: /*#__PURE__*/ jsx_runtime_.jsx(next_link["default"], {
                            href: "/",
                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                children: /*#__PURE__*/ jsx_runtime_.jsx(fa_.FaGithub, {
                                    size: "20px",
                                    fill: "#312880"
                                })
                            })
                        })
                    })
                ]
            })
        })
    })
;


// EXTERNAL MODULE: ./src/components/navigation/NavbarTwoColumns.tsx
var NavbarTwoColumns = __webpack_require__(8285);
// EXTERNAL MODULE: ./src/templates/Logo.tsx
var Logo = __webpack_require__(2160);
;// CONCATENATED MODULE: ./src/layout/header.tsx





function Header(props) {
    return(/*#__PURE__*/ jsx_runtime_.jsx(Background/* Background */.A, {
        color: "bg-transparent fixed w-full",
        children: /*#__PURE__*/ jsx_runtime_.jsx(Section, {
            yPadding: "py-6",
            children: /*#__PURE__*/ jsx_runtime_.jsx(NavbarTwoColumns/* NavbarTwoColumns */.g, {
                logo: /*#__PURE__*/ jsx_runtime_.jsx(Logo/* Logo */.T, {
                    xl: true,
                    noTheme: true
                }),
                noTheme: true,
                theme: props.theme
            })
        })
    }));
};


// EXTERNAL MODULE: external "react-slick"
var external_react_slick_ = __webpack_require__(8096);
var external_react_slick_default = /*#__PURE__*/__webpack_require__.n(external_react_slick_);
// EXTERNAL MODULE: external "next/router"
var router_ = __webpack_require__(1853);
// EXTERNAL MODULE: ./src/components/button/Button.tsx
var Button = __webpack_require__(7173);
;// CONCATENATED MODULE: ./src/components/slider/item.tsx



function SliderItem(props) {
    const router = (0,router_.useRouter)();
    return(/*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: "flex flex-col items-center",
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("img", {
                src: `${router.basePath}${props.image}`,
                alt: 'slider image'
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                className: "text-white text-2xl font-bold mt-8 mb-3",
                children: props.title
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("p", {
                className: "text-white opacity-80 text-sm text-center",
                children: props.description
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(Button/* Button */.z, {
                link: `${props.buttonLink}`,
                title: props.buttonTitle
            })
        ]
    }));
};


;// CONCATENATED MODULE: ./src/layout/banner.tsx





function Banner() {
    const items = [
        {
            title: 'Start Creating',
            description: 'Upload images, videos, blogs & audio all owned by you through the power of Web3',
            image: '/assets/images/homeSlider1.png',
            buttonTitle: 'Start creating',
            buttonLink: '/'
        },
        {
            title: 'Join our Discord',
            description: 'Join our community, help build a more equitable internet & creator economy and get rewarded!',
            image: '/assets/images/homeSlider2.png',
            buttonTitle: 'Join Discord',
            buttonLink: '/'
        },
        {
            title: 'Meet our partners',
            description: 'The people behind the technologies enabling a better digital future',
            image: '/assets/images/homeSlider3.png',
            buttonTitle: 'Partners',
            buttonLink: '/'
        },
        {
            title: 'Discover new creators',
            description: 'Support the creatives who are living the edge of creativity & technology',
            image: '/assets/images/homeSlider4.png',
            buttonTitle: 'Discover',
            buttonLink: '/'
        }, 
    ];
    const settings = {
        arrows: false,
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };
    return(/*#__PURE__*/ jsx_runtime_.jsx("div", {
        className: "w-1/2 slider-container p-5 flex items-center",
        children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
            children: /*#__PURE__*/ jsx_runtime_.jsx((external_react_slick_default()), {
                ...settings,
                className: "w-full",
                children: items.map((item, index)=>/*#__PURE__*/ jsx_runtime_.jsx(SliderItem, {
                        title: item.title,
                        description: item.description,
                        image: item.image,
                        buttonTitle: item.buttonTitle,
                        buttonLink: item.buttonLink
                    }, index)
                )
            })
        })
    }));
};


;// CONCATENATED MODULE: ./src/layout/Layout.tsx








function Layout(props) {
    return(/*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(Header, {
                theme: props.theme
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "content-wrapper min-h-screen",
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx(Banner, {
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("main", {
                        className: "w-1/2",
                        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "antialiased text-gray-600 h-full",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx(Meta/* Meta */.h, {
                                    title: AppConfig/* AppConfig.title */.X.title,
                                    description: AppConfig/* AppConfig.description */.X.description
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                    className: "w-full flex items-center h-full",
                                    children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: "max-w-md mx-auto w-full flex flex-col justify-between items-end h-screen overflow-y-scroll partner-container",
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx(Button/* Button */.z, {
                                                link: "/signupCreator",
                                                title: "Sign up as creator now!"
                                            }),
                                            props.children,
                                            /*#__PURE__*/ jsx_runtime_.jsx(Footer, {
                                            })
                                        ]
                                    })
                                })
                            ]
                        })
                    })
                ]
            })
        ]
    }));
};


/***/ })

};
;