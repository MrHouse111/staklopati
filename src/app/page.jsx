"use client";
import React, { useState, useEffect } from "react";
import RadioPlayer from "../components/radio-player";
import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [user, setUser] = useState({ id: "anonymous" });
  const [userLoading, setUserLoading] = useState(false);
  const [activeScreen, setActiveScreen] = useState("cities");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [error, setError] = useState(null);
  const [upload, { loading }] = useUpload();
  const [reviews, setReviews] = useState({});
  const [newReview, setNewReview] = useState({ text: "", image: null });
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reviewStatus, setReviewStatus] = useState({});
  const [favoriteItems, setFavoriteItems] = useState({});
  const [showFavorites, setShowFavorites] = useState(false);
  const [points, setPoints] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [restaurants, setRestaurants] = useState({});
  const [restaurantsLoading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantStatus, setRestaurantStatus] = useState({});
  const [userPreferences, setUserPreferences] = useState({
    badges: {
      "Prvi Pregled": false,
      "Redovan Korisnik": false,
      Gurman: false,
      Društvenjak: false,
      Ekspert: false,
      Foodie: true,
    },
    favoriteCategories: ["Roštilj", "Pica", "Salate"],
    visitedRestaurants: ["Caribic", "Dukat", "Kod Žike"],
  });
  const rewards = [
    { id: 1, description: "10% popusta na sledeću porudžbinu", points: 100 },
    { id: 2, description: "Besplatno piće uz obrok", points: 150 },
    { id: 3, description: "Besplatna dostava", points: 200 },
    { id: 4, description: "Besplatan obrok", points: 500 },
  ];
  const [menuData, setMenuData] = useState(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [lastSelectedCity, setLastSelectedCity] = useState(() => {
    // Provera da li se kod izvršava na klijentu pre pristupa localStorage-u
    if (typeof window !== 'undefined') {
      return localStorage.getItem("lastSelectedCity") || "";
    }
    return "";
  });
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (lastSelectedCity) {
      setSelectedCity(lastSelectedCity);
      setActiveScreen("restaurants");
      loadRestaurants(lastSelectedCity);
    }
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setChatLoading(true);
        const response = await fetch("/api/db/user-reviews", {
          method: "POST",
          body: JSON.stringify({
            query:
              "SELECT * FROM `chat_messages` ORDER BY created_at DESC LIMIT 50",
          }),
        });
        const messages = await response.json();
        setMessages(messages.reverse());
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

  const loadRestaurantMenu = async (restaurantId) => {
    try {
      setMenuLoading(true);
      setMenuError(null);
      const response = await fetch("/api/get-restaurant-menu", {
        method: "POST",
        body: JSON.stringify({ restaurantId }),
      });
      if (!response.ok) {
        throw new Error("Problem sa učitavanjem menija");
      }
      const data = await response.json();
      setMenuData(data);
    } catch (err) {
      console.error("Greška pri učitavanju menija:", err);
      setMenuError("Nije moguće učitati meni. Molimo pokušajte ponovo.");
    } finally {
      setMenuLoading(false);
    }
  };

  const checkRestaurantStatus = async (restaurantId) => {
    try {
      const response = await fetch("/api/check-restaurant-status", {
        method: "POST",
        body: JSON.stringify({ restaurantId }),
      });
      const data = await response.json();
      return data.isOpen;
    } catch (error) {
      console.error("Error checking restaurant status:", error);
      return null;
    }
  };

  const loadRestaurants = async (city) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/restaurants/by-city", {
        method: "POST",
        body: JSON.stringify({ city }),
      });
      if (!response.ok) {
        throw new Error(`Error loading restaurants: ${response.status}`);
      }
      const data = await response.json();

      const statuses = {};
      await Promise.all(
        data.restaurants.map(async (restaurant) => {
          statuses[restaurant.id] = await checkRestaurantStatus(restaurant.id);
        })
      );
      setRestaurantStatus(statuses);

      setRestaurants((prev) => ({
        ...prev,
        [city]: data.restaurants,
      }));
    } catch (err) {
      console.error("Error loading restaurants:", err);
      setError("Nije moguće učitati restorane. Molimo pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const renderChat = () => {
    if (!showChat) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-[#2a2a2a] rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <i className="fas fa-comments text-[#00bfa5] mr-2"></i>
              Chat
            </h2>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.user_id === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.user_id === user.id
                      ? "bg-[#00bfa5] text-white"
                      : "bg-[#3a3a3a] text-gray-200"
                  }`}
                >
                  <div className="text-sm opacity-75 mb-1">
                    {msg.user_id === user.id ? "Vi" : "Korisnik"}
                  </div>
                  <p>{msg.message}</p>
                  <div className="text-xs opacity-50 text-right mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bfa5]"></div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newMessage.trim()) return;

                const messageData = {
                  message: newMessage,
                  user_id: user.id,
                  created_at: new Date().toISOString(),
                };

                try {
                  setChatLoading(true);
                  await fetch("/api/db/user-reviews", {
                    method: "POST",
                    body: JSON.stringify({
                      query:
                        "INSERT INTO `chat_messages` (message, user_id, created_at) VALUES (?, ?, ?)",
                      values: [
                        messageData.message,
                        messageData.user_id,
                        messageData.created_at,
                      ],
                    }),
                  });

                  setMessages((prev) => [...prev, messageData]);
                  setNewMessage("");

                  const response = await fetch("/api/db/user-reviews", {
                    method: "POST",
                    body: JSON.stringify({
                      query:
                        "SELECT * FROM `chat_messages` ORDER BY created_at DESC LIMIT 50",
                    }),
                  });
                  const newMessages = await response.json();
                  setMessages(newMessages.reverse());
                } catch (error) {
                  console.error("Error sending message:", error);
                } finally {
                  setChatLoading(false);
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Napišite poruku..."
                className="flex-1 bg-[#3a3a3a] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bfa5]"
              />
              <button
                type="submit"
                disabled={chatLoading || !newMessage.trim()}
                className="bg-[#00bfa5] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00a693] transition-colors"
              >
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
      {activeScreen === "cities" && (
        <div className="flex flex-col items-center justify-center min-h-screen pt-16">
          <div className="fixed top-0 right-0 p-4 flex gap-4 z-50">
            <button
              onClick={() => setShowRadio(true)}
              className="text-gray-400 hover:text-[#00bfa5] transition-colors"
              aria-label="Otvori radio"
            >
              <i className="fas fa-radio text-2xl"></i>
            </button>
            <button
              onClick={() => {
                setShowChat(true);
                setActiveScreen("chat");
              }}
              className="text-gray-400 hover:text-[#00bfa5] transition-colors"
            >
              <i className="fas fa-comments text-2xl"></i>
            </button>
            <button
              onClick={() => setShowFavorites(true)}
              className="text-gray-400 hover:text-[#00bfa5] transition-colors"
            >
              <i className="fas fa-heart text-2xl"></i>
            </button>
            <button
              onClick={() => setActiveScreen("loyalty")}
              className="text-gray-400 hover:text-[#00bfa5] transition-colors"
            >
              <i className="fas fa-gift text-2xl"></i>
            </button>
            <button
              onClick={() => setActiveScreen("profile")}
              className="text-gray-400 hover:text-[#00bfa5] transition-colors"
            >
              <i className="fas fa-user text-2xl"></i>
            </button>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif mb-8">Šta Klopati</h1>
          <img
            src="https://ucarecdn.com/84e97dda-5149-45c9-910a-8ee1fcb5bf35/-/format/auto/"
            alt="Šta Klopati Logo"
            className="w-[120px] h-[120px] rounded-full mb-12"
          />

          <div className="flex flex-col gap-6 w-full max-w-xs">
            <button
              onClick={() => {
                setSelectedCity("Nova Pazova");
                setActiveScreen("restaurants");
                loadRestaurants("Nova Pazova");
                localStorage.setItem("lastSelectedCity", "Nova Pazova");
                setLastSelectedCity("Nova Pazova");
              }}
              className="group relative bg-gradient-to-r from-[#00bfa5] to-[#00a693] py-4 px-8 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
              <div className="flex items-center justify-center gap-3">
                <i className="fas fa-map-marker-alt"></i>
                <span>Nova Pazova</span>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedCity("Stara Pazova");
                setActiveScreen("restaurants");
                loadRestaurants("Stara Pazova");
                localStorage.setItem("lastSelectedCity", "Stara Pazova");
                setLastSelectedCity("Stara Pazova");
              }}
              className="group relative bg-gradient-to-r from-[#00bfa5] to-[#00a693] py-4 px-8 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
              <div className="flex items-center justify-center gap-3">
                <i className="fas fa-map-marker-alt"></i>
                <span>Stara Pazova</span>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedCity("Banovci");
                setActiveScreen("restaurants");
                loadRestaurants("Banovci");
                localStorage.setItem("lastSelectedCity", "Banovci");
                setLastSelectedCity("Banovci");
              }}
              className="group relative bg-gradient-to-r from-[#00bfa5] to-[#00a693] py-4 px-8 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
              <div className="flex items-center justify-center gap-3">
                <i className="fas fa-map-marker-alt"></i>
                <span>Banovci</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {activeScreen === "restaurants" && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                setActiveScreen("cities");
                localStorage.removeItem("lastSelectedCity");
                setLastSelectedCity("");
              }}
              className="text-[#00bfa5] flex items-center"
            >
              <i className="fas fa-city mr-2"></i>
              Promeni grad
            </button>
            <h2 className="text-2xl">{selectedCity}</h2>
          </div>

          {restaurantsLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfa5]"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center bg-[#2a2a2a] rounded-lg">
              <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
              <p>{error}</p>
              <button
                onClick={() => loadRestaurants(selectedCity)}
                className="mt-4 px-4 py-2 bg-[#00bfa5] rounded-lg text-white hover:bg-[#00a693]"
              >
                Pokušaj ponovo
              </button>
            </div>
          ) : restaurants[selectedCity]?.length > 0 ? (
            <div className="grid gap-4">
              {restaurants[selectedCity]
                .filter((restaurant) =>
                  restaurant.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((restaurant, index) => (
                  <div
                    key={index}
                    className="bg-[#2a2a2a] p-4 rounded-lg cursor-pointer hover:bg-[#3a3a3a] transition-all duration-200"
                    onClick={() => {
                      setSelectedRestaurant(restaurant);
                      setActiveScreen("menu");
                      loadRestaurantMenu(restaurant.id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl mb-2">{restaurant.name}</h3>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-400">{restaurant.hours}</p>
                          <p className="text-gray-400">{restaurant.phone}</p>
                        </div>
                      </div>

                      <div className="ml-4">
                        {restaurantStatus[restaurant.id] !== null && (
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              restaurantStatus[restaurant.id]
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {restaurantStatus[restaurant.id]
                              ? "Otvoreno"
                              : "Zatvoreno"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 p-8 bg-[#2a2a2a] rounded-lg">
              <i className="fas fa-store-alt-slash text-4xl mb-4"></i>
              <p>Trenutno nema dostupnih restorana u {selectedCity}</p>
            </div>
          )}
        </div>
      )}

      {activeScreen === "menu" && selectedRestaurant && (
        <div className="pb-20 relative min-h-screen">
          <div className="sticky top-0 bg-[#121212] z-10 p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setActiveScreen("restaurants")}
                className="text-[#00bfa5] flex items-center"
              >
                <i className="fas fa-arrow-left mr-2"></i> Nazad
              </button>
              <h2 className="text-xl font-semibold">
                {selectedRestaurant.name}
              </h2>
              <div className="w-8"></div>
            </div>

            <div className="flex items-center text-sm text-gray-400">
              <div className="flex items-center">
                <i className="far fa-clock mr-2"></i>
                <span>{selectedRestaurant.hours}</span>
              </div>
            </div>
          </div>

          {menuLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bfa5]"></div>
            </div>
          ) : menuError ? (
            <div className="text-red-500 p-4 text-center bg-[#2a2a2a] rounded-lg m-4">
              <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
              <p>{menuError}</p>
              <button
                onClick={() => loadRestaurantMenu(selectedRestaurant.id)}
                className="mt-4 px-4 py-2 bg-[#00bfa5] rounded-lg text-white hover:bg-[#00a693]"
              >
                Pokušaj ponovo
              </button>
            </div>
          ) : menuData ? (
            <>
              <div className="sticky top-[72px] bg-[#121212] z-10 border-b border-gray-800">
                <div className="overflow-x-auto hide-scrollbar">
                  <div className="flex p-2 space-x-2 min-w-max">
                    {Object.keys(menuData.menu).map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                          activeCategory === category
                            ? "bg-[#00bfa5] text-white"
                            : "bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]"
                        }`}
                      >
                        {category === "Roštilj" && (
                          <i className="fas fa-fire mr-2"></i>
                        )}
                        {category === "Prilozi" && (
                          <i className="fas fa-utensils mr-2"></i>
                        )}
                        {category === "Salate" && (
                          <i className="fas fa-leaf mr-2"></i>
                        )}
                        {category === "Pića" && (
                          <i className="fas fa-glass-martini mr-2"></i>
                        )}
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid gap-3">
                  {menuData.menu[
                    activeCategory || Object.keys(menuData.menu)[0]
                  ]?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#3a3a3a] transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium mb-1">
                            {item.name}
                          </h4>
                          <div className="space-y-1">
                            {item.description && (
                              <p className="text-sm text-gray-400">
                                {item.description}
                              </p>
                            )}
                            {item.portion && (
                              <p className="text-sm text-gray-400 flex items-center">
                                <i className="fas fa-weight mr-2"></i>
                                {item.portion}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end ml-4">
                          <span className="text-[#00bfa5] font-semibold mb-2">
                            {item.price} RSD
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const key = `${selectedRestaurant.name}-${item.name}`;
                              setFavoriteItems((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                              }));
                            }}
                            className="text-2xl transition-colors duration-200 hover:scale-110"
                          >
                            <i
                              className={`fas fa-heart ${
                                favoriteItems[
                                  `${selectedRestaurant.name}-${item.name}`
                                ]
                                  ? "text-red-500"
                                  : "text-gray-400"
                              }`}
                            ></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 p-8">
              <p>Meni nije dostupan</p>
            </div>
          )}

          <a
            href={`tel:${selectedRestaurant.phone}`}
            className="fixed bottom-6 right-6 bg-[#00bfa5] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#00a693] transition-colors z-40"
          >
            <i className="fas fa-phone text-white text-2xl"></i>
          </a>
        </div>
      )}

      {activeScreen === "loyalty" && (
        <div className="min-h-screen bg-[#121212] p-4">
          <div className="sticky top-0 bg-[#121212] z-10 pb-4">
            <button
              onClick={() => setActiveScreen("cities")}
              className="text-[#00bfa5] flex items-center mb-4"
            >
              <i className="fas fa-arrow-left mr-2"></i> Nazad
            </button>
            <h2 className="text-2xl font-semibold mb-2">Loyalty Program</h2>
            <div className="bg-[#2a2a2a] p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Vaši poeni</p>
                  <p className="text-3xl font-bold text-[#00bfa5]">{points}</p>
                </div>
                <i className="fas fa-star text-[#00bfa5] text-4xl"></i>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-[#2a2a2a] p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium mb-1">
                      {reward.description}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Potrebno poena: {reward.points}
                    </p>
                  </div>
                  <button
                    disabled={points < reward.points || reward.claimed}
                    onClick={() => {
                      alert("Nagrada je uspešno aktivirana!");
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      points >= reward.points && !reward.claimed
                        ? "bg-[#00bfa5] text-white"
                        : "bg-gray-600 text-gray-400"
                    }`}
                  >
                    {reward.claimed ? "Iskorišćeno" : "Aktiviraj"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeScreen === "profile" && (
        <div className="min-h-screen bg-[#121212] p-4">
          <div className="sticky top-0 bg-[#121212] z-10 pb-4">
            <button
              onClick={() => setActiveScreen("cities")}
              className="text-[#00bfa5] flex items-center mb-4"
            >
              <i className="fas fa-arrow-left mr-2"></i> Nazad
            </button>
            <h2 className="text-2xl font-semibold mb-4">Vaš Profil</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-3xl text-[#00bfa5]"></i>
                </div>
                <div>
                  <h3 className="text-xl font-medium">Korisnik</h3>
                  <p className="text-gray-400">ID: {user.id}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Vaša Dostignuća</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(userPreferences.badges).map(
                  ([badge, earned], index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-center ${
                        earned ? "bg-[#00bfa5] bg-opacity-20" : "bg-[#3a3a3a]"
                      }`}
                    >
                      <i
                        className={`fas fa-${
                          earned
                            ? "check-circle text-[#00bfa5]"
                            : "circle text-gray-400"
                        } text-2xl mb-2`}
                      ></i>
                      <p className="text-sm">{badge}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Omiljene Kategorije</h3>
              <div className="flex flex-wrap gap-2">
                {userPreferences.favoriteCategories.map((category, index) => (
                  <span
                    key={index}
                    className="bg-[#3a3a3a] px-3 py-1 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Posećeni Restorani</h3>
              <div className="space-y-2">
                {userPreferences.visitedRestaurants.map((restaurant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span>{restaurant}</span>
                    <i className="fas fa-check text-[#00bfa5]"></i>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeScreen === "chat" && (
        <div className="fixed inset-0 bg-[#121212] z-50 flex flex-col">
          <div className="bg-[#2a2a2a] px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center">
              <button
                onClick={() => {
                  setShowChat(false);
                  setActiveScreen("cities");
                }}
                className="mr-3 text-gray-400 hover:text-white"
              >
                <i className="fas fa-arrow-left text-lg"></i>
              </button>
              <div>
                <h2 className="text-lg font-semibold">Grupni Chat</h2>
                <p className="text-sm text-gray-400">
                  {messages.length} poruka •{" "}
                  {new Set(messages.map((m) => m.user_id)).size} učesnika
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            id="chat-messages"
          >
            {messages.map((msg, index) => {
              const isFirstInGroup =
                index === 0 || messages[index - 1].user_id !== msg.user_id;
              const isLastInGroup =
                index === messages.length - 1 ||
                messages[index + 1].user_id !== msg.user_id;

              return (
                <div
                  key={index}
                  className={`flex ${
                    msg.user_id === user.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      !isLastInGroup ? "mb-1" : "mb-3"
                    }`}
                  >
                    {isFirstInGroup && (
                      <div
                        className={`text-sm mb-1 ${
                          msg.user_id === user.id
                            ? "text-right text-gray-300"
                            : "text-gray-300"
                        }`}
                      >
                        {msg.user_id === user.id
                          ? "Vi"
                          : `Korisnik ${msg.user_id.slice(0, 4)}`}
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.user_id === user.id
                          ? "bg-[#00bfa5] text-white rounded-tr-none"
                          : "bg-[#3a3a3a] text-gray-200 rounded-tl-none"
                      }`}
                    >
                      <p className="text-[15px] leading-tight">{msg.message}</p>
                      <div className="text-[11px] opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {Object.keys(typingUsers).length > 0 && (
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span>
                  {Object.keys(typingUsers).length === 1
                    ? `${Object.keys(typingUsers)[0]} kuca...`
                    : `${Object.keys(typingUsers).length} korisnika kucaju...`}
                </span>
              </div>
            )}
          </div>

          <div className="bg-[#2a2a2a] p-3 border-t border-gray-700">
            {showEmojiPicker && (
              <div className="absolute bottom-20 right-4 bg-[#3a3a3a] rounded-lg shadow-xl p-2">
                <div className="grid grid-cols-8 gap-2">
                  {[
                    "😊",
                    "😂",
                    "❤️",
                    "👍",
                    "😍",
                    "🎉",
                    "👋",
                    "🤔",
                    "😅",
                    "🙌",
                    "🤷‍♂️",
                    "🔥",
                    "👏",
                    "💪",
                    "🙏",
                    "✨",
                  ].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setNewMessage((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl hover:bg-[#4a4a4a] p-2 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newMessage.trim()) return;

                const messageData = {
                  message: newMessage,
                  user_id: user.id,
                  created_at: new Date().toISOString(),
                };

                try {
                  setChatLoading(true);
                  await fetch("/api/db/user-reviews", {
                    method: "POST",
                    body: JSON.stringify({
                      query:
                        "INSERT INTO `chat_messages` (message, user_id, created_at) VALUES (?, ?, ?)",
                      values: [
                        messageData.message,
                        messageData.user_id,
                        messageData.created_at,
                      ],
                    }),
                  });

                  setMessages((prev) => [...prev, messageData]);
                  setNewMessage("");
                  setTypingUsers((prev) => {
                    const newTyping = { ...prev };
                    delete newTyping[user.id];
                    return newTyping;
                  });

                  const chatContainer =
                    document.getElementById("chat-messages");
                  chatContainer.scrollTop = chatContainer.scrollHeight;
                } catch (error) {
                  console.error("Error sending message:", error);
                  alert("Greška pri slanju poruke. Pokušajte ponovo.");
                } finally {
                  setChatLoading(false);
                }
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (e.target.value) {
                      setTypingUsers((prev) => ({ ...prev, [user.id]: true }));
                      setTimeout(() => {
                        setTypingUsers((prev) => {
                          const newTyping = { ...prev };
                          delete newTyping[user.id];
                          return newTyping;
                        });
                      }, 2000);
                    }
                  }}
                  placeholder="Napišite poruku..."
                  className="w-full bg-[#3a3a3a] rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bfa5]"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#00bfa5] hover:text-[#00a693]"
                >
                  <i className="fas fa-smile text-xl"></i>
                </button>
              </div>

              <button
                type="submit"
                disabled={chatLoading || !newMessage.trim()}
                className="p-2 bg-[#00bfa5] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00a693] transition-colors"
              >
                <i className="fas fa-paper-plane text-xl"></i>
              </button>
            </form>
          </div>
        </div>
      )}

      {showFavorites && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-[#2a2a2a]">
              <h2 className="text-xl font-semibold flex items-center">
                <i className="fas fa-heart text-red-500 mr-2"></i>
                Omiljena jela
              </h2>
              <button
                onClick={() => setShowFavorites(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div
              className="p-4 overflow-y-auto"
              style={{ maxHeight: "calc(80vh - 70px)" }}
            >
              {Object.entries(favoriteItems).filter(
                ([, isFavorite]) => isFavorite
              ).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <i className="far fa-heart text-4xl mb-3"></i>
                  <p>Nemate označenih omiljenih jela</p>
                  <p className="text-sm mt-2">
                    Označite srce pored jela da ga dodate u omiljene
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(favoriteItems).map(([key, isFavorite]) => {
                    if (!isFavorite) return null;
                    const [restaurant, item] = key.split("-");
                    return (
                      <div
                        key={key}
                        className="bg-[#3a3a3a] rounded-lg p-3 flex justify-between items-center group hover:bg-[#4a4a4a] transition-colors"
                      >
                        <div>
                          <p className="font-medium">{item}</p>
                          <p className="text-sm text-gray-400">{restaurant}</p>
                        </div>
                        <button
                          onClick={() =>
                            setFavoriteItems((prev) => ({
                              ...prev,
                              [key]: false,
                            }))
                          }
                          className="text-red-500 opacity-75 group-hover:opacity-100 transition-opacity"
                        >
                          <i className="fas fa-heart"></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRadio && (
        <RadioPlayer isOpen={showRadio} onClose={() => setShowRadio(false)} />
      )}

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default MainComponent;