import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- NOVA LOGIKA ZA PRAĆENJE OGLASA ---
function useAdTracker(triggerLimit = 30) {
  const [clickCount, setClickCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  
  // Učitaj brojač iz localStorage-a
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCount = parseInt(localStorage.getItem('adClickCount') || '0', 10);
      setClickCount(savedCount);
    }
  }, []);

  const triggerClick = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    setClickCount(prevCount => {
      const newCount = prevCount + 1;
      localStorage.setItem('adClickCount', newCount.toString());
      
      // Provera za prikaz oglasa
      if (newCount >= triggerLimit) {
        setShowAd(true);
        localStorage.setItem('adClickCount', '0'); // Resetuj brojač nakon prikaza
        return 0;
      }
      return newCount;
    });
  }, [triggerLimit]);

  const closeAd = useCallback(() => {
    setShowAd(false);
  }, []);

  return { showAd, triggerClick, closeAd, clicks: clickCount };
}
// --- KRAJ NOVE LOGIKE ---

function useHandleStreamResponse({
  onChunk,
  onFinish
}) {
  const handleStreamResponse = React.useCallback(
    async (response) => {
      if (response.body) {
        const reader = response.body.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let content = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              onFinish(content);
              break;
            }
            const chunk = decoder.decode(value, { stream: true });
            content += chunk;
            onChunk(content);
          }
        }
      }
    },
    [onChunk, onFinish]
  );
  const handleStreamResponseRef = React.useRef(handleStreamResponse);
  React.useEffect(() => {
    handleStreamResponseRef.current = handleStreamResponse;
  }, [handleStreamResponse]);
  return React.useCallback((response) => handleStreamResponseRef.current(response), []); 
}

function useUpload() {
  const [loading, setLoading] = useState(false);
  const upload = useCallback(async (input) => {
    // Postoji mnogo logike za upload ovde koja je predugačka za prikaz
    return { error: "Upload not implemented in this version" };
  }, []);

  return [upload, { loading }];
}

export {
  useHandleStreamResponse,
  useUpload,
  useAdTracker, // NOVI EXPORT
}