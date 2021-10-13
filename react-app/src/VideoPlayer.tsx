import React, {CSSProperties, useEffect, useRef} from "react";
import Hls from "hls.js";

const VideoPlayer = (props) => {
  const video = useRef<any>(null)
  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();

      const encryptedZipBlob = (fetch(props.url)).then(response => 
        { 
          response.blob().then(blob => {
            let tests = blob;

            blob.text().then(text => console.log(text));
            hls.loadSource(props.url);
            hls.attachMedia(video.current);
          
          })
        }
          );
    }
  }, [props.url])
  return (<video ref={video} controls />)
//   <video className="video-container video-container-overlay" autoPlay={false} loop={false} muted={false} controls={true} data-reactid=".0.1.0.0">
//   <source type="video/mp4" data-reactid=".0.1.0.0.0" src={props.url}/>
// </video>
}

export {VideoPlayer}
