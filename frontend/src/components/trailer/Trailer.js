import {useParams} from "react-router-dom";
import "./Trailer.css";


const Trailer = () => {
  let params = useParams();
  const key = params.ytTrailerId;

  console.log("Trailer key:", key);

  return (
    <div className='react-player-container'>
      {key ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${key}?autoplay=0&controls=1`}
          title="Movie Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            minHeight: '500px'
          }}
        />
      ) : (
        <div style={{color: 'white', textAlign: 'center', padding: '50px'}}>
          This video is now unavailable!
        </div>
      )}
    </div>
  )
};

export default Trailer;
