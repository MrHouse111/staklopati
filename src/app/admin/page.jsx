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

  // Load restaurants when the restaurants tab is active
  useEffect(() => {
    if (activeTab === "restaurants") {
      loadRestaurants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // *** ISPRAVLJENA PUTANJA (bilo je verify-admin-password) ***
      const response = await fetch("/api/verify-admin", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setError("");
      } else {
        setError(data.error || "Pogrešna lozinka");
      }
    } catch (err) {
      console.error(err);
      setError("Došlo je do greške pri povezivanju sa serverom");
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 font-roboto text-black">
            Admin Panel
          </h1>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Unesite admin lozinku"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
    <div className="min-h-screen bg-gray-100 text-black">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen shadow-md">
          <div className="p-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="mt-4">
            <button onClick={() => setActiveTab("dashboard")} className={`w-full text-left p-3 hover:bg-gray-100 ${activeTab === "dashboard" ? "bg-gray-100" : ""}`}>Dashboard</button>
            <button onClick={() => setActiveTab("restaurants")} className={`w-full text-left p-3 hover:bg-gray-100 ${activeTab === "restaurants" ? "bg-gray-100" : ""}`}>Restorani</button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            
            {activeTab === "dashboard" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Dobrodošao nazad!</h2>
                <p>Izaberi opciju iz menija sa leve strane.</p>
              </div>
            )}

            {activeTab === "restaurants" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Upravljanje restoranima</h2>
                
                {/* Forma */}
                <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="p-2 border rounded" placeholder="Ime restorana" />
                    <select value={city} onChange={(e) => setCity(e.target.value)} className="p-2 border rounded">
                      <option value="Nova Pazova">Nova Pazova</option>
                      <option value="Stara Pazova">Stara Pazova</option>
                      <option value="Banovci">Banovci</option>
                    </select>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="p-2 border rounded" placeholder="Adresa" />
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="p-2 border rounded" placeholder="Telefon" />
                    <input type="text" value={workHours} onChange={(e) => setWorkHours(e.target.value)} className="p-2 border rounded md:col-span-2" placeholder="Radno vreme" />
                  </div>
                  {restaurantError && <p className="text-red-500 text-sm">{restaurantError}</p>}
                  <button onClick={handleAddRestaurant} disabled={restaurantLoading} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    {restaurantLoading ? 'Dodavanje...' : 'Dodaj restoran'}
                  </button>
                </div>

                {/* Lista */}
                <div className="space-y-2">
                  {restaurantsList.map((r) => (
                    <div key={r.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                      <div>
                        <p className="font-bold">{r.name}</p>
                        <p className="text-sm text-gray-600">{r.city}, {r.address}</p>
                      </div>
                      <button onClick={() => handleDeleteRestaurant(r.id)} className="text-red-500 hover:text-red-700">Obriši</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;