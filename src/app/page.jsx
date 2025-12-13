"use client";
import React, { useState, useEffect, useRef } from "react"; 
import RadioPlayer from "../components/radio-player";
import { useUpload, useAdTracker } from "../utilities/runtime-helpers"; // DODATO useAdTracker

// Pomoćna funkcija za fetch
const apiFetch = async (endpoint, body) => {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
        throw new Error(errorData.error || `Greška na serveru [${res.status}]`);
    }
    return await res.json();
  } catch (e) {
    console.error("API Fetch Error:", e.message);
    return { error: e.message };
  }
};

function MainComponent() {
  const { showAd, triggerClick, closeAd, clicks } = useAdTracker(30); // Prag za oglas je 30 klikova
  const chatMessagesRef = useRef(null);

  const [user, setUser] = useState({ id: "anonymous", name: "" }); // DODATO: name
  const [activeScreen, setActiveScreen] = useState("cities");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Chat Identity State
  const [showNameInput, setShowNameInput] = useState(false);
  const [tempUserName, setTempUserName] = useState("");

  const [restaurants, setRestaurants] = useState({});
  const [menuData, setMenuData] = useState(null);
  const [favoriteItems, setFavoriteItems] = useState({});
  const [points, setPoints] = useState(0);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [restaurantsLoading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuError, setMenuError] = useState(null);
  const [restaurantStatus, setRestaurantStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Nagrade i Preferences
  const [userPreferences] = useState({ /* ... */ });
  const [rewards] = useState([ /* ... */ ]);


  // --- CHAT LOGIKA ---

  // 1. UČITAVANJE IMENA I ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
        let userId = localStorage.getItem('userId');
        let userName = localStorage.getItem('userName');

        if (!userId) {
            userId = 'anon_' + Date.now();
            localStorage.setItem('userId', userId);
        }
        
        setUser({ id: userId, name: userName || 'Anonimni' });
        
        if (!userName) {
            setShowNameInput(true);
        }
    }
  }, []);

  // 2. SKROLOVANJE CHATA
  useEffect(() => {
    if (showChat && chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, showChat]);

  // 3. REAL-TIME POLLING ZA CHAT (svakih 5 sekundi)
  useEffect(() => {
    const loadMessages = async () => {
        const data = await apiFetch("/api/db/chat-messages", { query: "SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50" });
        if (data && Array.isArray(data.messages)) {
            // Dodata logika za prikaz imena umesto ID-a
            const formattedMessages = data.messages.map(msg => ({
                ...msg,
                userName: msg.user_name || 'Anonimni'
            }));
            setMessages(formattedMessages.reverse());
        }
    };

    if (showChat) {
        loadMessages();
        const interval = setInterval(loadMessages, 5000); // Polling na 5 sekundi
        return () => clearInterval(interval);
    }
  }, [showChat]);

  // 4. SNIMANJE IMENA KORISNIKA
  const handleSaveName = () => {
    if (tempUserName.trim()) {
        localStorage.setItem('userName', tempUserName.trim());
        setUser(prev => ({ ...prev, name: tempUserName.trim() }));
        setShowNameInput(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || chatLoading) return;
    
    // Provera da li je ime postavljeno pre slanja poruke
    if (!user.name || user.name === 'Anonimni') {
        setShowNameInput(true);
        return;
    }

    setChatLoading(true);
    const messageData = { 
        message: newMessage, 
        user_id: user.id, 
        user_name: user.name, // Šaljemo ime
        created_at: new Date().toISOString() 
    };

    // Optimizovano: odma prikaži poruku
    setMessages((prev) => [...prev, { ...messageData, userName: user.name }]);
    setNewMessage("");

    try {
        await apiFetch("/api/db/chat-messages", {
            action: "create",
            data: { message: messageData.message, user_id: messageData.user_id, user_name: messageData.user_name }
        });
    } catch(e) {
        console.error("Greška pri slanju poruke:", e);
    } finally {
        setChatLoading(false);
    }
  };

  // --- OSTALE FUNKCIJE ---
  
  const checkRestaurantStatus = async (restaurantId) => {
    // Koristimo popravljenu logiku za radno vreme
    const data = await apiFetch("/api/check-restaurant-status", { restaurantId });
    return data ? data.isOpen : false; 
  };

  const loadRestaurants = async (city) => {
    triggerClick(); // Brojimo klik
    // ... ostatak loadRestaurants funkcije ...
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch("/api/restaurants/by-city", { city });
      
      if (!data || !data.restaurants || data.error) {
        setRestaurants((prev) => ({ ...prev, [city]: [] }));
        if (data && data.error) setError(data.error); 
        return;
      }

      const statuses = {};
      if (Array.isArray(data.restaurants)) {
          // Ažuriramo status na osnovu nove logike
          data.restaurants.forEach(r => statuses[r.id] = checkRestaurantStatus(r.id));
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
    triggerClick(); // Brojimo klik
    // ... ostatak loadRestaurantMenu funkcije ...
    setMenuData(null); setMenuError(null);
    try {
      setMenuLoading(true);
      const data = await apiFetch("/api/restaurant-menu", { restaurantId });

      if (data && data.error) throw new Error(data.error);
      
      if (!data || !data.menu || Object.keys(data.menu).length === 0) throw new Error("Meni nije pronađen.");
      
      setMenuData(data);
      if (Object.keys(data.menu).length > 0) setActiveCategory(Object.keys(data.menu)[0]);
    } catch (err) {
      setMenuError(err.message || "Nije moguće učitati meni.");
    } finally {
      setMenuLoading(false);
    }
  };

  // --- RENDER CHAT SEKCIJE (SA POPRAVLJENIM INPUTOM) ---
  const renderChat = () => {
    if (!showChat) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-0 md:p-4">
        <div className="bg-[#2a2a2a] w-full h-full md:h-[80vh] md:w-[500px] md:rounded-lg flex flex-col">
          {/* HEADER CHATA */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#2a2a2a]">
            <h2 className="text-xl font-semibold flex items-center text-white">
              <i className="fas fa-comments text-[#00bfa5] mr-2"></i>
              Grupni Chat
            </h2>
            <button
              onClick={() => { setShowChat(false); triggerClick(); }}
              className="bg-[#00bfa5] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#00a693] transition-colors flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Nazad
            </button>
          </div>

          {/* PORUKE (DODAT REF ZA SKROLOVANJE) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20" ref={chatMessagesRef}> 
            {messages.length === 0 && (<div className="text-center text-gray-500 mt-10">Nema poruka. Budite prvi!</div>)}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.user_id === user.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.user_id === user.id ? "bg-[#00bfa5] text-white" : "bg-[#3a3a3a] text-gray-200"}`}>
                  <p className="text-sm font-bold opacity-80 mb-1">{msg.user_name || msg.userName || 'Anonimni'}:</p> {/* PRIKAZ IMENA */}
                  <p>{msg.message}</p>
                  <div className="text-xs opacity-50 text-right mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* UNOS PORUKE (FIKSIRAN NA DNU) */}
          <div className="fixed bottom-0 left-0 right-0 md:relative md:p-4 p-4 border-t border-gray-700 bg-[#2a2a2a] z-50 md:z-auto">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={user.name === 'Anonimni' ? "Unesite ime pre kucanja" : "Napišite poruku..."}
                className="flex-1 bg-[#3a3a3a] rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00bfa5]"
                disabled={chatLoading || user.name === 'Anonimni'}
              />
              <button type="submit" disabled={chatLoading} className="bg-[#00bfa5] text-white px-4 py-2 rounded-full hover:bg-[#00a693]">
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
            <button onClick={() => { setShowRadio(true); triggerClick(); }} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-radio text-2xl"></i></button>
            <button onClick={() => { setShowChat(true); triggerClick(); }} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-comments text-2xl"></i></button>
            <button onClick={() => { setShowFavorites(true); triggerClick(); }} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-heart text-2xl"></i></button>
            <button onClick={() => { setActiveScreen("loyalty"); triggerClick(); }} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-gift text-2xl"></i></button>
            <button onClick={() => { setActiveScreen("profile"); triggerClick(); }} className="text-gray-400 hover:text-[#00bfa5]"><i className="fas fa-user text-2xl"></i></button>
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
                  triggerClick(); // Brojimo klik
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
            <button onClick={() => { setActiveScreen("cities"); localStorage.removeItem("lastSelectedCity"); triggerClick(); }} className="text-[#00bfa5] flex items-center">
              <i className="fas fa-arrow-left mr-2"></i> Promeni grad
            </button>
            <h2 className="text-2xl font-bold">{selectedCity}</h2>
          </div>

          {restaurantsLoading ? (
            <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfa5] mx-auto"></div></div>
          ) : restaurants[selectedCity]?.length > 0 ? (
            <div className="grid gap-4">
              {restaurants[selectedCity].filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((restaurant, index) => (
                <div key={index} className="bg-[#2a2a2a] p-4 rounded-lg cursor-pointer hover:bg-[#3a3a3a]" onClick={() => { setSelectedRestaurant(restaurant); setActiveScreen("menu"); loadRestaurantMenu(restaurant.id); triggerClick(); }}>
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
            {/* Header za meni */}
            <div className="sticky top-0 bg-[#121212] z-10 p-4 border-b border-gray-800">
                <button onClick={() => { setActiveScreen("restaurants"); triggerClick(); }} className="text-[#00bfa5] flex items-center mb-4">
                    <i className="fas fa-arrow-left mr-2"></i> Nazad na restorane
                </button>
                <h2 className="text-2xl font-bold mb-1">{selectedRestaurant.name}</h2>
                <p className="text-sm text-gray-400">{selectedRestaurant.hours}</p>
            </div>
            
            {menuError && (
                 <div className="text-red-500 p-4 text-center bg-[#2a2a2a] rounded-lg m-4">{menuError}</div>
            )}

            {menuLoading ? (
                <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfa5] mx-auto"></div></div>
            ) : menuData && menuData.menu && Object.keys(menuData.menu).length > 0 ? (
                <>
                    {/* Traka za kategorije */}
                    <div className="sticky top-[95px] bg-[#121212] z-10 border-b border-gray-800">
                        <div className="overflow-x-auto hide-scrollbar">
                            <div className="flex p-2 space-x-2 min-w-max">
                                {Object.keys(menuData.menu).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => { setActiveCategory(category); triggerClick(); }}
                                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${ activeCategory === category ? "bg-[#00bfa5] text-white" : "bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]" }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lista jela za odabranu kategoriju */}
                    <div className="p-4">
                        <div className="grid gap-3">
                            {(menuData.menu[activeCategory] || []).map((item, index) => (
                                <div key={index} className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#3a3a3a] transition-colors duration-200">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium mb-1">{item.name}</h4>
                                            {item.description && (<p className="text-sm text-gray-400">{item.description}</p>)}
                                        </div>

                                        <div className="flex flex-col items-end ml-4">
                                            <span className="text-[#00bfa5] font-semibold mb-2">
                                                {item.price} RSD
                                            </span>
                                            {/* Dugme za omiljeno */}
                                            <button onClick={(e) => { e.stopPropagation(); const key = `${selectedRestaurant.name}-${item.name}`; setFavoriteItems((prev) => ({ ...prev, [key]: !prev[key], })); triggerClick(); }} className="text-2xl transition-colors duration-200 hover:scale-110">
                                                <i className={`fas fa-heart ${ favoriteItems[`${selectedRestaurant.name}-${item.name}`] ? "text-red-500" : "text-gray-400" }`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center p-10 text-gray-500">Meni nije dostupan.</div>
            )}
            
            {/* Dugme za poziv: POZICIONIRANO VIŠE IZNAD AD BANNERA */}
            {selectedRestaurant?.phone && (
                <a
                    href={`tel:${selectedRestaurant.phone}`}
                    className="fixed bottom-20 right-6 bg-[#00bfa5] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#00a693] transition-colors z-40"
                    onClick={() => triggerClick()} // Brojimo klik
                >
                    <i className="fas fa-phone text-white text-2xl"></i>
                </a>
            )}
        </div>
      )}

      {/* OSTALI EKRANI */}
      {activeScreen === "loyalty" && <div className="p-4"><button onClick={() => { setActiveScreen("cities"); triggerClick(); }} className="text-[#00bfa5] mb-4">Nazad</button><h2 className="text-2xl">Loyalty</h2></div>}
      {activeScreen === "profile" && <div className="p-4"><button onClick={() => { setActiveScreen("cities"); triggerClick(); }} className="text-[#00bfa5] mb-4">Nazad</button><h2 className="text-2xl">Profil</h2></div>}

      {/* POPUP: Video Oglas (Interstital) */}
      {showAd && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[1000]">
              <div className="bg-[#2a2a2a] p-6 rounded-lg w-full max-w-md text-center">
                  <h3 className="text-white text-2xl mb-4">Video Oglas</h3>
                  <p className="text-gray-400 mb-6">Oglas bi išao ovde. (Brojač klikova je resetovan)</p>
                  <button onClick={closeAd} className="bg-red-600 text-white px-6 py-2 rounded-lg">Zatvori Oglas</button>
              </div>
          </div>
      )}
      
      {/* POPUP: UNOS IMENA ZA CHAT */}
      {showNameInput && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[1000]">
              <div className="bg-[#2a2a2a] p-6 rounded-lg w-full max-w-sm text-center">
                  <h3 className="text-white text-xl mb-4">Unesite Vaše Ime</h3>
                  <p className="text-gray-400 mb-4">Ovo će biti vidljivo u chatu.</p>
                  <input
                    type="text"
                    value={tempUserName}
                    onChange={(e) => setTempUserName(e.target.value)}
                    placeholder="Vaše Ime"
                    className="w-full bg-[#3a3a3a] text-white rounded-lg px-4 py-2 mb-4 focus:outline-none"
                    maxLength={15}
                  />
                  <button onClick={handleSaveName} disabled={!tempUserName.trim()} className="bg-[#00bfa5] text-white px-6 py-2 rounded-lg disabled:opacity-50">
                    Sačuvaj
                  </button>
              </div>
          </div>
      )}

      {/* OSTALI POPUP KOMPONENTE */}
      {showChat && renderChat()}
      {showRadio && <RadioPlayer isOpen={showRadio} onClose={() => { setShowRadio(false); triggerClick(); }} />}
      {showFavorites && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 p-4 flex items-center justify-center">
              {/* ... Omiljeno UI ... */}
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