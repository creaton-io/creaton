import React, {CSSProperties, useEffect, useRef} from "react";
import Hls from "hls.js";

const VideoPlayer = (props) => {
  const video = useRef<any>(null)
  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(props.url);
      hls.attachMedia(video.current);
    }
  }, [props.url])
  return (<video ref={video} controls style={{'maxWidth': '300px'} as CSSProperties}/>)
}

export {VideoPlayer}
