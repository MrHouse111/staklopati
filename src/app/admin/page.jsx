"use client";
import React, { useState, useEffect } from "react";

function MainComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // --- Restaurants management state ---
  const [restaurantName, setRestaurantName] = useState("");
  const [city, setCity] = useState("Nova Pazova");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [restaurantError, setRestaurantError] = useState("");

  useEffect(() => {
    if (activeTab === "restaurants") {
      loadRestaurants();
    }
  }, [activeTab]);

  const loadRestaurants = async () => {
    try {
      const response = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      });
      const data = await response.json();
      if (data.restaurants) {
        setRestaurantsList(data.restaurants);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRestaurant = async () => {
    setRestaurantLoading(true);
    setRestaurantError("");
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          restaurant: {
            name: restaurantName,
            city,
            address,
            phone: phone || null,
            delivery_info: workHours || null,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRestaurantName("");
        setCity("Nova Pazova");
        setAddress("");
        setPhone("");
        setWorkHours("");
        await loadRestaurants();
      } else {
        setRestaurantError(data.error || "Greška pri dodavanju restorana");
      }
    } catch (err) {
      setRestaurantError("Došlo je do greške");
    }
    setRestaurantLoading(false);
  };

  const handleDeleteRestaurant = async (id) => {
    try {
      await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", restaurant: { id } }),
      });
      await loadRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const verifyPassword = async () => {
    setLoading(true);
    try {
      // *** OVDE JE BILA GREŠKA, SAD JE ISPRAVLJENO ***
      const response = await fetch("/api/verify-admin", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setError("");
      } else {
        setError(data.error || "Greška pri verifikaciji");
      }
    } catch (err) {
      setError("Došlo je do greške");
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 font-roboto">
            Admin Panel
          </h1>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Unesite admin lozinku"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && verifyPassword()}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={verifyPassword}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
              {loading ? "Provera..." : "Prijavi se"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <div className="w-64 bg-white h-screen shadow-md">
          <div className="p-4">
            <h1 className="text-xl font-bold font-roboto">Admin Panel</h1>
          </div>
          <nav className="mt-4">
            {[
              { id: "dashboard", name: "Dashboard", icon: "fa-chart-line" },
              { id: "cities", name: "Gradovi", icon: "fa-city" },
              { id: "restaurants", name: "Restorani", icon: "fa-utensils" },
              { id: "menu", name: "Meni", icon: "fa-book-open" },
              { id: "users", name: "Korisnici", icon: "fa-users" },
              { id: "reviews", name: "Recenzije", icon: "fa-star" },
              { id: "points", name: "Poeni", icon: "fa-coins" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-3 flex items-center space-x-3 hover:bg-gray-100 transition-colors ${
                  activeTab === tab.id ? "bg-gray-100" : ""
                }`}
              >
                <i className={`fas ${tab.icon} w-6`}></i>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Ukupno korisnika</h3>
                    <i className="fas fa-users text-blue-500 text-xl"></i>
                  </div>
                  <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Ukupno restorana</h3>
                    <i className="fas fa-utensils text-green-500 text-xl"></i>
                  </div>
                  <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Ukupno gradova</h3>
                    <i className="fas fa-city text-purple-500 text-xl"></i>
                  </div>
                  <p className="text-3xl font-bold mt-2">0</p>
                </div>
              </div>
            )}

            {activeTab === "cities" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Upravljanje gradovima</h2>
                <p className="text-gray-600">Ovde će biti forma za upravljanje gradovima</p>
              </div>
            )}

            {activeTab === "restaurants" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Upravljanje restoranima</h2>
                <div className="mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ime restorana</label>
                      <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="npr. Caffe Club 22" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Grad</label>
                      <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Nova Pazova">Nova Pazova</option>
                        <option value="Stara Pazova">Stara Pazova</option>
                        <option value="Banovci">Banovci</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Adresa</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="npr. Karađorđeva 10" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Telefon</label>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="npr. 0631234567" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Radno vreme (npr. 08:00 - 23:00)</label>
                      <input type="text" value={workHours} onChange={(e) => setWorkHours(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="08:00 - 23:00" />
                    </div>
                  </div>
                  {restaurantError && <p className="text-red-500 text-sm">{restaurantError}</p>}
                  <button type="button" onClick={handleAddRestaurant} disabled={restaurantLoading || !restaurantName || !city || !address} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300">
                    {restaurantLoading ? 'Dodavanje...' : 'Dodaj restoran'}
                  </button>
                </div>
                <h3 className="text-lg font-bold mb-2">Postojeći restorani</h3>
                {restaurantsList.length === 0 ? (
                  <p className="text-gray-600">Nema restorana</p>
                ) : (
                  <ul className="space-y-2">
                    {restaurantsList.map((r) => (
                      <li key={r.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{r.name}</p>
                          <p className="text-sm text-gray-600">{r.city} • {r.address}</p>
                        </div>
                        <button type="button" onClick={() => handleDeleteRestaurant(r.id)} className="text-red-500 hover:underline">Obriši</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {/* Ostali tabovi */}
            {activeTab === "menu" && <div><h2 className="text-xl font-bold mb-4">Upravljanje menijem</h2><p className="text-gray-600">Ovde će biti forma za upravljanje menijem</p></div>}
            {activeTab === "users" && <div><h2 className="text-xl font-bold mb-4">Statistika korisnika</h2><p className="text-gray-600">Ovde će biti pregled korisničke aktivnosti</p></div>}
            {activeTab === "reviews" && <div><h2 className="text-xl font-bold mb-4">Upravljanje recenzijama</h2><p className="text-gray-600">Ovde će biti pregled i moderacija recenzija</p></div>}
            {activeTab === "points" && <div><h2 className="text-xl font-bold mb-4">Konfiguracija poena</h2><p className="text-gray-600">Ovde će biti podešavanja sistema poena i nagrada</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;