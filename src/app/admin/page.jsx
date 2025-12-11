"use client";
import React from "react";

function MainComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  const verifyPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/verify-admin-password", {
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
                <h2 className="text-xl font-bold mb-4">
                  Upravljanje gradovima
                </h2>
                <p className="text-gray-600">
                  Ovde će biti forma za upravljanje gradovima
                </p>
              </div>
            )}

            {activeTab === "restaurants" && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Upravljanje restoranima
                </h2>
                <p className="text-gray-600">
                  Ovde će biti forma za upravljanje restoranima
                </p>
              </div>
            )}

            {activeTab === "menu" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Upravljanje menijem</h2>
                <p className="text-gray-600">
                  Ovde će biti forma za upravljanje menijem
                </p>
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Statistika korisnika</h2>
                <p className="text-gray-600">
                  Ovde će biti pregled korisničke aktivnosti
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Upravljanje recenzijama
                </h2>
                <p className="text-gray-600">
                  Ovde će biti pregled i moderacija recenzija
                </p>
              </div>
            )}

            {activeTab === "points" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Konfiguracija poena</h2>
                <p className="text-gray-600">
                  Ovde će biti podešavanja sistema poena i nagrada
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;