import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

// Plays a green-screen video and keys out the green so only the subject shows.
const ChromaKeyVideo = forwardRef(function ChromaKeyVideo({ src, onEnded, onPlayBlocked, className, style }, ref) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
  }));

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let raf;

    // Browsers block unmuted autoplay without a user gesture — surface it so
    // the player can show a tap-to-start overlay instead of a black box.
    const p = video.play();
    if (p?.catch) p.catch(() => onPlayBlocked?.());

    const draw = () => {
      if (video.videoWidth) {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = frame.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (g > 90 && g > r * 1.35 && g > b * 1.35) d[i + 3] = 0;
        }
        ctx.putImageData(frame, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [src]);

  return (
    <>
      <video ref={videoRef} key={src} src={src} autoPlay playsInline crossOrigin="anonymous" className="hidden" onEnded={onEnded} />
      <canvas ref={canvasRef} className={className} style={style} />
    </>
  );
});

export default ChromaKeyVideo;