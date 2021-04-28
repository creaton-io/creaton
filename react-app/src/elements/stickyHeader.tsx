import React, {createRef, useState, useEffect} from "react";

interface HeaderProps{ 
    className?: string;
    sticky?: boolean;
  }
export const Header  = (props: HeaderProps) => {
  const [isSticky, setIsSticky] = useState(false)
  const ref = React.createRef<any>();
  
  // mount 
  useEffect(()=>{
    const header = document.getElementById("myHeader");
    const stickyPoint = header!.offsetTop;
    const cachedRef = ref.current,
          observer = new IntersectionObserver(
            ([e]) => setIsSticky(window.pageYOffset > stickyPoint),
            {threshold: [1]}
          )

    observer.observe(cachedRef)
    
    // unmount
    return function(){
      observer.unobserve(cachedRef)
    }
  }, [])

  return (
    <header id="myHeader" className={(isSticky ? " isSticky" : "")} ref={ref}>
      This is a sticky header
    </header>
  )
}
