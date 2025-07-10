import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

const VideoPlayer = ({ item, fileUrls }) => {
  console.log('=== VideoPlayer RENDERED ===');
  console.log('Item:', item);
  console.log('FileUrls:', fileUrls);
  
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef(null);

  // Function to normalize YouTube URL to embed format
  const normalizeYouTubeUrl = (url) => {
    if (!url) return null;
    
    // Already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Regular YouTube watch URL
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    // YouTube short URL
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    // Vimeo URL
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    
    // Return as is for other embed URLs
    return url;
  };

  // Get the best available video source
  const getVideoSource = () => {
    // Priority: uploaded file > src > url > videoUrl
    if (item.uploadMethod === 'upload' && item.fileId && fileUrls[item.fileId]) {
      return {
        type: 'upload',
        url: fileUrls[item.fileId]
      };
    }
    
    const videoSrc = item.src || item.url || item.videoUrl;
    if (videoSrc) {
      const normalizedUrl = normalizeYouTubeUrl(videoSrc);
      return {
        type: 'embed',
        url: normalizedUrl,
        originalUrl: videoSrc
      };
    }
    
    return null;
  };

  const videoSource = getVideoSource();

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
    setVideoError(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIsLoading(false);
    setVideoError(true);
  };

  // Retry loading video
  const handleRetry = () => {
    setVideoError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        iframeRef.current.src = src;
      }, 100);
    }
  };

  // Open video in new tab
  const openInNewTab = () => {
    if (videoSource?.originalUrl || videoSource?.url) {
      if (typeof window !== 'undefined') {
        window.open(videoSource.originalUrl || videoSource.url, '_blank');
      }
    }
  };

  useEffect(() => {
    setVideoError(false);
    setIsLoading(true);
  }, [item, fileUrls]);

  // Debug logging
  console.log('VideoPlayer Debug:', {
    item,
    videoSource,
    fileUrls: item.fileId ? { [item.fileId]: fileUrls[item.fileId] } : {},
    isLoading,
    videoError,
    retryCount
  });
  
  // Detailed URL logging
  console.log('Video URL Details:', {
    'item.src': item.src,
    'item.url': item.url,
    'item.videoUrl': item.videoUrl,
    'uploadMethod': item.uploadMethod,
    'fileId': item.fileId,
    'fileUrl': item.fileId ? fileUrls[item.fileId] : null,
    'normalizedUrl': videoSource?.url,
    'originalUrl': videoSource?.originalUrl,
    'videoType': videoSource?.type
  });

  if (!videoSource) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-center mb-2">Video tidak tersedia</p>
        <p className="text-xs text-gray-400 text-center">
          Debug: {JSON.stringify({
            src: item.src,
            url: item.url,
            videoUrl: item.videoUrl,
            uploadMethod: item.uploadMethod,
            fileId: item.fileId
          }, null, 2)}
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{paddingBottom: '56.25%'}}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
          <div className="text-center text-white">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading video...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
          <div className="text-center text-white p-6">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="mb-4">Gagal memuat video</p>
            <div className="space-x-2">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Coba Lagi
              </button>
              {(videoSource.originalUrl || videoSource.url) && (
                <button
                  onClick={openInNewTab}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  Buka di Tab Baru
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Content */}
      {videoSource.type === 'upload' ? (
        <video
          src={videoSource.url}
          className="absolute top-0 left-0 w-full h-full"
          controls
          title={item.title}
          onLoadStart={() => setIsLoading(true)}
          onLoadedData={() => setIsLoading(false)}
          onError={handleIframeError}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <iframe
          ref={iframeRef}
          src={`${videoSource.url}${videoSource.url.includes('?') ? '&' : '?'}enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={item.title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      )}
    </div>
  );
};

export default VideoPlayer;