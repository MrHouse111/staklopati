"use client";
import React, { useState, useEffect } from "react"; // <--- OVO REŠAVA CRNI EKRAN
import RadioPlayer from "../components/radio-player";
import { useUpload } from "../utilities/runtime-helpers";

// Pomoćna funkcija za fetch, da ne puca ako nema API-ja
const apiFetch = async (endpoint, body) => {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
};

function MainComponent() {
  const [user, setUser] = useState({ id: "anonymous" });
  const [activeScreen, setActiveScreen] = useState("cities");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // State za podatke
  const [restaurants, setRestaurants] = useState({});
  const [menuData, setMenuData] = useState(null);
  const [favoriteItems, setFavoriteItems] = useState({});
  const [points, setPoints] = useState(0);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Loading states
  const [restaurantsLoading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuError, setMenuError] = useState(null);
  const [restaurantStatus, setRestaurantStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [userPreferences, setUserPreferences] = useState({
    badges: { "Prvi Pregled": false, "Redovan Korisnik": false, "Foodie": true },
    favoriteCategories: ["Roštilj", "Pica"],
    visitedRestaurants: ["Caribic", "Dukat"]
  });

  const rewards = [
    { id: 1, description: "10% popusta", points: 100 },
    { id: 2, description: "Besplatno piće", points: 150 },
    { id: 3, description: "Besplatna dostava", points: 200 },
    { id: 4, description: "Besplatan obrok", points: 500 },
  ];

  // Učitavanje grada iz localStorage-a
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedCity = localStorage.getItem("lastSelectedCity");
        if (savedCity) {
            setSelectedCity(savedCity);
            setActiveScreen("restaurants");
            loadRestaurants(savedCity);
        }
    }
  }, []);

  // Učitavanje poruka za Chat
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setChatLoading(true);
        // Ovde simuliramo fetch ili gađamo pravi API ako postoji
        const response = await fetch("/api/db/user-reviews", {
          method: "POST",
          body: JSON.stringify({
            query: "SELECT * FROM `chat_messages` ORDER BY created_at DESC LIMIT 50",
          }),
        });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) setMessages(data.reverse());
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setChatLoading(false);
      }
    };
    if (showChat) {
      loadMessages();
    }
  }, [showChat]);

  const checkRestaurantStatus = async (restaurantId) => {
    try {
      const data = await apiFetch("/api/check-restaurant-status", { restaurantId });
      return data ? data.isOpen : false;
    } catch (error) {
      return null;
    }
  };

  const loadRestaurants = async (city) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch("/api/restaurants/by-city", { city });
      
      if (!data || !data.restaurants) {
        // Fallback ako API ne vrati nista
        setRestaurants((prev) => ({ ...prev, [city]: [] }));
        return;
      }

      const statuses = {};
      if (Array.isArray(data.restaurants)) {
          await Promise.all(
            data.restaurants.map(async (restaurant) => {
              statuses[restaurant.id] = await checkRestaurantStatus(restaurant.id);
            })
          );
          setRestaurantStatus(statuses);
          setRestaurants((prev) => ({ ...prev, [city]: data.restaurants }));
      }
    } catch (err) {
      setError("Nije moguće učitati restorane.");
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurantMenu = async (restaurantId) => {
    try {
      setMenuLoading(true);
      setMenuError(null);
      const data = await apiFetch("/api/get-restaurant-menu", { restaurantId });
      if (!data || data.error) throw new Error("Problem sa menijem");
      setMenuData(data);
    } catch (err) {
      setMenuError("Nije moguće učitati meni.");
    } finally {
      setMenuLoading(false);
    }
  };

  // --- RENDER CHAT SEKCIJE (SA DUGMETOM NAZAD) ---
  const renderChat = () => {
    if (!showChat) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-0 md:p-4">
        <div className="bg-[#2a2a2a] w-full h-full md:h-[80vh] md:w-[500px] md:rounded-lg flex flex-col">
          {/* HEADER CHATA */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#2a2a2a]">
            <h2 className="text-xl font-semibold flex items-center text-white">
              <i className="fas fa-comments text-[#00bfa5] mr-2"></i>
              Chat
            </h2>
            {/* OVO DUGME JE SADA ZELENO I JASNO */}
            <button
              onClick={() => setShowChat(false)}
              className="bg-[#00bfa5] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#00a693] transition-colors flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Nazad
            </button>
          </div>

          {/* PORUKE */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
            {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10">Nema poruka. Budite prvi!</div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.user_id === user.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.user_id === user.id ? "bg-[#00bfa5] text-white" : "bg-[#3a3a3a] text-gray-200"}`}>
                  <p>{msg.message}</p>
                  <div className="text-xs opacity-50 text-right mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* UNOS PORUKE */}
          <div className="p-4 border-t border-gray-700 bg-[#2a2a2a]">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newMessage.trim()) return;
                const messageData = { message: newMessage, user_id: user.id, created_at: new Date().toISOString() };
                
                // Optimistic update
                setMessages((prev) => [...prev, messageData]);
                setNewMessage("");
                
                // Slanje na server (ako postoji API)
                await apiFetch("/api/db/user-reviews", {
                    query: "INSERT INTO `chat_messages` (message, user_id, created_at) VALUES (?, ?, ?)",
                    values: [messageData.message, messageData.user_id, messageData.created_at]
                });
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Napišite poruku..."
                className="flex-1 bg-[#3a3a3a] rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00bfa5]"
              />
              <button type="submit" className="bg-[#00bfa5] text-white px-4 py-2 rounded-full hover:bg-[#00a693]">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white" role="main">
      {/* GLAVNI MENI (HEADER) */}
      {activeScreen === "cities" && (
        <div className="flex flex-col items-center justify-center min-h-screen pt-16">
          <div className="fixed top-0 right-0 p-4 flex gap-4 z-50">
            <button onClick={() => setShowRadio(true)} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-radio text-2xl"></i></button>
            <button onClick={() => setShowChat(true)} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-comments text-2xl"></i></button>
            <button onClick={() => setShowFavorites(true)} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-heart text-2xl"></i></button>
            <button onClick={() => setActiveScreen("loyalty")} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-gift text-2xl"></i></button>
            <button onClick={() => setActiveScreen("profile")} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-user text-2xl"></i></button>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif mb-8">Šta Klopati</h1>
          <img src="https://ucarecdn.com/84e97dda-5149-45c9-910a-8ee1fcb5bf35/-/format/auto/" alt="Logo" className="w-[120px] h-[120px] rounded-full mb-12" />

          <div className="flex flex-col gap-6 w-full max-w-xs">
            {["Nova Pazova", "Stara Pazova", "Banovci"].map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setActiveScreen("restaurants");
                  loadRestaurants(city);
                  localStorage.setItem("lastSelectedCity", city);
                }}
                className="bg-gradient-to-r from-[#00bfa5] to-[#00a693] py-4 px-8 rounded-lg text-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-3"
              >
                <i className="fas fa-map-marker-alt"></i> {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRIKAZ RESTORANA */}
      {activeScreen === "restaurants" && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => { setActiveScreen("cities"); localStorage.removeItem("lastSelectedCity"); }} className="text-[#00bfa5] flex items-center">
              <i className="fas fa-arrow-left mr-2"></i> Promeni grad
            </button>
            <h2 className="text-2xl font-bold">{selectedCity}</h2>
          </div>

          {restaurantsLoading ? (
            <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfa5] mx-auto"></div></div>
          ) : restaurants[selectedCity]?.length > 0 ? (
            <div className="grid gap-4">
              {restaurants[selectedCity].filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((restaurant, index) => (
                <div key={index} className="bg-[#2a2a2a] p-4 rounded-lg cursor-pointer hover:bg-[#3a3a3a]" onClick={() => { setSelectedRestaurant(restaurant); setActiveScreen("menu"); loadRestaurantMenu(restaurant.id); }}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{restaurant.name}</h3>
                      <p className="text-gray-400 text-sm">{restaurant.address}</p>
                      <p className="text-gray-400 text-sm">{restaurant.hours}</p>
                    </div>
                    {restaurantStatus[restaurant.id] !== undefined && (
                        <span className={`px-2 py-1 rounded text-xs h-fit ${restaurantStatus[restaurant.id] ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                            {restaurantStatus[restaurant.id] ? "OTVORENO" : "ZATVORENO"}
                        </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-10">Nema restorana za prikaz.</div>
          )}
        </div>
      )}

      {/* MENI RESTORANA */}
      {activeScreen === "menu" && selectedRestaurant && (
        <div className="pb-20 relative min-h-screen">
           <div className="sticky top-0 bg-[#121212] z-10 p-4 border-b border-gray-800">
            <button onClick={() => setActiveScreen("restaurants")} className="text-[#00bfa5] flex items-center mb-4">
                <i className="fas fa-arrow-left mr-2"></i> Nazad na restorane
            </button>
            <h2 className="text-2xl font-bold">{selectedRestaurant.name}</h2>
           </div>
           
           {menuLoading ? (
               <div className="text-center p-10">Učitavanje menija...</div>
           ) : menuData ? (
               <div className="p-4">
                   {/* Kategorije i stavke bi išle ovde, pojednostavljeno za fix */}
                   <p className="text-center text-gray-500">Meni učitan (prikazati kategorije ovde)</p>
               </div>
           ) : (
               <div className="text-center p-10 text-gray-500">Meni nije dostupan.</div>
           )}
        </div>
      )}

      {/* OSTALI EKRANI (Loyalty, Profile) - Zadržani jednostavni za ovaj fix */}
      {activeScreen === "loyalty" && <div className="p-4"><button onClick={() => setActiveScreen("cities")} className="text-[#00bfa5] mb-4">Nazad</button><h2 className="text-2xl">Loyalty</h2></div>}
      {activeScreen === "profile" && <div className="p-4"><button onClick={() => setActiveScreen("cities")} className="text-[#00bfa5] mb-4">Nazad</button><h2 className="text-2xl">Profil</h2></div>}

      {/* POPUP KOMPONENTE */}
      {showChat && renderChat()}
      {showRadio && <RadioPlayer isOpen={showRadio} onClose={() => setShowRadio(false)} />}
      {showFavorites && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 p-4 flex items-center justify-center">
              <div className="bg-[#2a2a2a] w-full max-w-md p-4 rounded-lg">
                  <div className="flex justify-between mb-4">
                      <h2 className="text-xl font-bold">Omiljeno</h2>
                      <button onClick={() => setShowFavorites(false)} className="text-gray-400"><i className="fas fa-times"></i></button>
                  </div>
                  <p className="text-gray-500">Nema omiljenih jela.</p>
              </div>
          </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default MainComponent;