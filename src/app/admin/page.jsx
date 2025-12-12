"use client";
import React, { useState, useEffect } from "react";

function MainComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("restaurants");
  const [loading, setLoading] = useState(false);

  // --- RESTORANI STATE ---
  const [restaurantName, setRestaurantName] = useState("");
  const [city, setCity] = useState("Nova Pazova");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  // NOVI STATE: Za radno vreme
  const [openingTime, setOpeningTime] = useState("08:00"); 
  const [closingTime, setClosingTime] = useState("23:00");
  
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [restaurantError, setRestaurantError] = useState("");

  // EDIT STATE: Za modal za izmenu
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditRest, setCurrentEditRest] = useState(null);

  // --- MENI STATE ---
  const [selectedRestForMenu, setSelectedRestForMenu] = useState("");
  const [menuCategories, setMenuCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [selectedCategoryForItem, setSelectedCategoryForItem] = useState("");
  const [menuStatus, setMenuStatus] = useState(""); 


  useEffect(() => {
    if (isAuthenticated) {
        // Učitavanje restorana za oba taba (Restorani i Meni)
        loadRestaurants();
    }
  }, [isAuthenticated]);

  useEffect(() => {
      if (selectedRestForMenu) {
          loadMenuData(selectedRestForMenu);
      } else {
          setMenuCategories([]);
          setMenuItems([]);
      }
  }, [selectedRestForMenu]);

  // --- API FUNKCIJE ---

  const loadRestaurants = async () => {
    try {
      const response = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      });
      const data = await response.json();
      if (data.restaurants) setRestaurantsList(data.restaurants);
    } catch (err) { console.error(err); }
  };

  const loadMenuData = async (restaurantId) => {
      setMenuStatus("Učitavanje...");
      try {
          const catRes = await fetch("/api/admin/menus", {
              method: "POST", body: JSON.stringify({ action: "readCategories", menu: { restaurantId } })
          });
          const catData = await catRes.json();
          setMenuCategories(catData.categories || []);

          const itemRes = await fetch("/api/admin/menus", {
            method: "POST", body: JSON.stringify({ action: "readMenuItems", menu: { restaurantId } })
          });
          const itemData = await itemRes.json();
          setMenuItems(itemData.menuItems || []);
          setMenuStatus("Meni učitan.");
      } catch (err) { 
          setMenuStatus("Greška pri učitavanju menija.");
          console.error(err); 
      }
  };


  const handleAddRestaurant = async () => {
    setRestaurantLoading(true);
    setRestaurantError("");
    try {
      // PROSLEĐUJEMO NOVE TIME VREDNOSTI
      await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          restaurant: {
            name: restaurantName,
            city,
            address,
            phone,
            openingTime,
            closingTime
          },
        }),
      });
      setRestaurantName(""); setAddress(""); setPhone(""); 
      setOpeningTime("08:00"); setClosingTime("23:00");
      await loadRestaurants();
    } catch (err) {
      setRestaurantError("Došlo je do greške");
    }
    setRestaurantLoading(false);
  };

  // --- NOVA FUNKCIJA: OTVARANJE MODALA ---
  const openEditModal = (restaurant) => {
    // Parsiramo HOURS polje (npr. "08:00 - 23:00") na dve vrednosti
    const [openTime, closeTime] = (restaurant.hours || "08:00 - 23:00").split(' - ');
    setCurrentEditRest({
        ...restaurant,
        openingTime: openTime,
        closingTime: closeTime,
    });
    setIsEditModalOpen(true);
  };

  // --- NOVA FUNKCIJA: AŽURIRANJE RESTORANA ---
  const handleUpdateRestaurant = async () => {
    if (!currentEditRest) return;
    setLoading(true);
    try {
      await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          restaurant: {
            id: currentEditRest.id,
            name: currentEditRest.name,
            city: currentEditRest.city,
            address: currentEditRest.address,
            phone: currentEditRest.phone,
            openingTime: currentEditRest.openingTime,
            closingTime: currentEditRest.closingTime,
          },
        }),
      });
      setIsEditModalOpen(false);
      await loadRestaurants();
    } catch (err) {
      alert("Greška pri ažuriranju.");
    } finally {
        setLoading(false);
    }
  };


  const handleDeleteRestaurant = async (id) => {
    if(!confirm("Da li ste sigurni da želite obrisati ovaj restoran?")) return;
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
  
  // --- OSTALE MENI FUNKCIJE SU ISTE ---
  const handleAddCategory = async () => {
      if (!selectedRestForMenu || !newCategoryName) return;
      setMenuStatus("Dodavanje kategorije...");
      try {
          await fetch("/api/admin/menus", {
              method: "POST", body: JSON.stringify({ action: "createCategory", category: { name: newCategoryName, restaurantId: selectedRestForMenu } })
          });
          setNewCategoryName("");
          loadMenuData(selectedRestForMenu);
      } catch (e) { setMenuStatus("Greška."); }
  };
  const handleAddItem = async () => {
      if (!selectedCategoryForItem || !newItemName || !newItemPrice) return;
      setMenuStatus("Dodavanje jela...");
      try {
          await fetch("/api/admin/menus", {
              method: "POST",
              body: JSON.stringify({
                  action: "createMenuItem",
                  menu: { name: newItemName, price: parseFloat(newItemPrice), description: newItemDesc, categoryId: selectedCategoryForItem }
              })
          });
          setNewItemName(""); setNewItemPrice(""); setNewItemDesc("");
          loadMenuData(selectedRestForMenu);
      } catch (e) { setMenuStatus("Greška."); }
  };
  const handleDeleteItem = async (id) => {
      if(!confirm("Da li ste sigurni da želite obrisati ovo jelo?")) return;
      await fetch("/api/admin/menus", {
          method: "POST", body: JSON.stringify({ action: "deleteMenuItem", menu: { id } })
      });
      loadMenuData(selectedRestForMenu);
  }

  // --- AUTH ---
  const verifyPassword = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/verify-admin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok && data.success) setIsAuthenticated(true);
      else setError(data.error || "Pogrešna lozinka");
    } catch (err) { setError("Greška pri povezivanju sa serverom"); } finally { setLoading(false); }
  };


  // --- RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {/* Login UI je nepromenjen */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen shadow-md fixed left-0 top-0">
          <div className="p-4 border-b"><h1 className="font-bold text-xl">Admin Panel</h1></div>
          <nav className="p-2">
            <button onClick={() => setActiveTab("restaurants")} className={`w-full text-left p-3 rounded ${activeTab==="restaurants" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}><i className="fas fa-utensils w-6 text-center"></i> Restorani</button>
            <button onClick={() => setActiveTab("menu")} className={`w-full text-left p-3 rounded ${activeTab==="menu" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}><i className="fas fa-book-open w-6 text-center"></i> Meni i Cenovnik</button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 ml-64">
          <div className="bg-white rounded-lg shadow-md p-6">
            
            {/* TAB RESTORANI */}
            {activeTab === "restaurants" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Upravljanje restoranima</h2>
                
                {/* Forma za dodavanje - IZMENJENA POLJA ZA VREME */}
                <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded border">
                  <h3 className="font-semibold mb-2">Dodaj novi restoran</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="p-2 border rounded col-span-2" placeholder="Ime restorana" />
                    <select value={city} onChange={(e) => setCity(e.target.value)} className="p-2 border rounded col-span-2">
                      <option value="Nova Pazova">Nova Pazova</option><option value="Stara Pazova">Stara Pazova</option><option value="Banovci">Banovci</option>
                    </select>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="p-2 border rounded col-span-2" placeholder="Adresa" />
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="p-2 border rounded col-span-2" placeholder="Telefon" />
                    
                    <label className="block text-sm font-medium mb-1 pt-2">Otvaranje:</label>
                    <input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} className="p-2 border rounded col-span-1" />
                    
                    <label className="block text-sm font-medium mb-1 pt-2">Zatvaranje:</label>
                    <input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} className="p-2 border rounded col-span-1" />
                  </div>
                  {restaurantError && <p className="text-red-500 text-sm mt-2">{restaurantError}</p>}
                  <button onClick={handleAddRestaurant} disabled={restaurantLoading} className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 mt-4 font-medium">
                    {restaurantLoading ? 'Dodavanje...' : 'Dodaj restoran'}
                  </button>
                </div>

                {/* Lista restorana - DODATO DUGME ZA IZMENU */}
                <h3 className="font-semibold mb-3 text-lg">Lista restorana</h3>
                <div className="space-y-2">
                  {restaurantsList.length === 0 && <p className="text-gray-500">Nema unetih restorana.</p>}
                  {restaurantsList.map((r) => (
                    <div key={r.id} className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 bg-white shadow-sm">
                      <div>
                        <p className="font-bold text-lg">{r.name}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">{r.city}</span> • {r.address} | Vreme: {r.hours}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(r)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded transition-colors text-sm">
                            Izmeni
                        </button>
                        <button onClick={() => handleDeleteRestaurant(r.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm">
                            Obriši
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB MENI I CENOVNIK (PRETHODNO SREĐEN) */}
            {activeTab === "menu" && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Uređivanje Menija</h2>
                    
                    {/* 1. Izbor restorana */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2">Izaberi restoran:</label>
                        <select 
                            className="border p-2 rounded w-full" 
                            value={selectedRestForMenu} 
                            onChange={(e) => setSelectedRestForMenu(e.target.value)}
                        >
                            <option value="">-- Izaberi --</option>
                            {restaurantsList.map(r => (
                                <option key={r.id} value={r.id}>{r.name} ({r.city})</option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2">Status menija: {menuStatus}</p>
                    </div>

                    {selectedRestForMenu && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 2. Kategorije */}
                            <div className="border p-4 rounded bg-gray-50">
                                <h3 className="font-bold mb-2">1. Kategorije (npr. Doručak)</h3>
                                <div className="flex gap-2 mb-4">
                                    <input className="border p-2 rounded flex-1" placeholder="Naziv kategorije" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}/>
                                    <button onClick={handleAddCategory} className="bg-green-600 text-white px-3 rounded text-lg font-bold hover:bg-green-700">+</button>
                                </div>
                                <ul className="list-disc pl-5 space-y-1">
                                    {menuCategories.map(c => (<li key={c.id}>{c.name} (ID: {c.id})</li>))}
                                </ul>
                            </div>

                            {/* 3. Jela */}
                            <div className="border p-4 rounded bg-gray-50">
                                <h3 className="font-bold mb-2">2. Stavke Menija</h3>
                                <div className="space-y-2 mb-4">
                                    <select className="border p-2 rounded w-full" value={selectedCategoryForItem} onChange={e => setSelectedCategoryForItem(e.target.value)}>
                                        <option value="">-- Izaberi Kategoriju --</option>
                                        {menuCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <input className="border p-2 rounded w-full" placeholder="Naziv jela" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                                    <input className="border p-2 rounded w-full" placeholder="Cena (RSD)" type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
                                    <textarea className="border p-2 rounded w-full" placeholder="Opis (opciono)" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} />
                                    <button onClick={handleAddItem} disabled={!selectedCategoryForItem || !newItemName || !newItemPrice} className="bg-blue-600 text-white w-full py-2 rounded disabled:bg-gray-400 hover:bg-blue-700">Dodaj Jelo</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
          </div>
        </div>
      </div>
      
      {/* MODAL ZA IZMENU RESTORANA */}
      {/* NOVI MODAL UI (dodajemo ga ovde) */}
      
    </div>
  );
}

export default MainComponent;