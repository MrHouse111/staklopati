"use client";
import React, { useState, useRef, useEffect } from "react";

export default function RadioPlayer({ isOpen, onClose }) {
  const [activeStation, setActiveStation] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [searchTerm, setSearchTerm] = useState('');
  const audioRef = useRef(null);

  const radioStations = [
    {
      id: 1,
      name: 'Radio Stara Pazova',
      streamUrl: 'http://95.140.123.22:8000/listen.pls',
      icon: 'radio'
    },
    {
      id: 2,
      name: 'Radio S',
      streamUrl: 'https://53be5ef2d13aa.streamlock.net/asmedia/radios/playlist.m3u8',
      icon: 'broadcast-tower'
    },
    {
      id: 3,
      name: 'Radio Hit FM',
      streamUrl: 'https://streaming.hitfm.rs/hit.mp3',
      icon: 'music'
    },
    {
      id: 4,
      name: 'Radio AS FM',
      streamUrl: 'https://mastermedia.shoutca.st/proxy/radioasfm?mp=/stream',
      icon: 'signal'
    },
    {
      id: 5,
      name: 'Play Radio',
      streamUrl: 'https://stream.playradio.rs:8443/play.mp3',
      icon: 'play-circle'
    },
    {
      id: 6,
      name: 'TDI Radio',
      streamUrl: 'https://streaming.tdiradio.com/tdiradio.mp3',
      icon: 'broadcast-tower'
    }
  ];

  const filteredStations = radioStations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = (station) => {
    if (audioRef.current) {
      if (activeStation?.id === station.id) {
        audioRef.current.pause();
        setActiveStation(null);
      } else {
        audioRef.current.src = station.streamUrl;
        audioRef.current.play().catch(e => console.error("Error playing:", e));
        setActiveStation(station);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            <i className="fas fa-radio text-[#00bfa5] mr-2"></i>
            Radio Stanice
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Pretraži radio stanice..."
            className="w-full bg-[#3a3a3a] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bfa5]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((station) => (
            <div
              key={station.id}
              className="bg-[#3a3a3a] rounded-lg p-4 flex flex-col items-center hover:bg-[#4a4a4a] transition-colors"
            >
              <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4 relative">
                {activeStation?.id === station.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#00bfa5] animate-sound-wave"
                          style={{
                            height: '60%',
                            animationDelay: `${i * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <i className={`fas fa-${station.icon} text-[#00bfa5] text-2xl ${activeStation?.id === station.id ? 'opacity-50' : ''}`}></i>
              </div>
              <h3 className="text-white font-medium text-center mb-4">{station.name}</h3>
              <button
                onClick={() => togglePlay(station)}
                className="w-12 h-12 bg-[#00bfa5] rounded-full flex items-center justify-center hover:bg-[#00a693] transition-transform hover:scale-105"
              >
                <i className={`fas fa-${activeStation?.id === station.id ? 'pause' : 'play'} text-white`}></i>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center space-x-3">
          <i className="fas fa-volume-down text-gray-400"></i>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-[#3a3a3a] rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00bfa5 0%, #00bfa5 ${volume * 100}%, #3a3a3a ${volume * 100}%, #3a3a3a 100%)`
            }}
          />
          <i className="fas fa-volume-up text-gray-400"></i>
        </div>

        <audio 
          ref={audioRef} 
          preload="none"
          onError={() => setActiveStation(null)}
        />
      </div>

      <style jsx>{`
        .animate-sound-wave {
          animation: sound-wave 1s ease-in-out infinite;
          transform-origin: bottom;
        }

        @keyframes sound-wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #00bfa5;
          border-radius: 50%;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #00bfa5;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}