import Array "mo:base/Array";
import Map "mo:core/Map";
import Nat "mo:base/Nat";
import Principal "mo:core/Principal";
import Text "mo:base/Text";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {

  // ─── Authorization (kept for upgrade compatibility) ────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── Types ────────────────────────────────────────────────────────────────

  type CategoryName = Text;
  type Timestamp    = Nat;

  type Ingredient = { name : Text; category : CategoryName };
  type Meal       = { name : Text; ingredients : [Ingredient] };

  type DailyRecord = {
    meals        : [Meal];
    timestamp    : Timestamp;
    restaurantName : Text;
  };

  type UserProfile = { name : Text; restaurantName : Text };

  type Restaurant = { id : Text; name : Text };

  type RestaurantUser = {
    username       : Text;
    password       : Text;
    restaurantName : Text;
  };

  type MasterCategory = { id : Text; name : Text };

  type RawMaterial = { id : Text; name : Text; category : Text };

  type RestaurantAssignment = {
    restaurantName   : Text;
    allowedCategories : [Text];
    allowedItems     : [Text];
  };

  // ─── OLD Stable Vars (kept verbatim for upgrade compatibility) ────────────
  stable var nextDailyRecordId : Nat = 0;
  let users = Map.empty<Principal, [DailyRecord]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let legacyIngredients : [Ingredient] = [];
  let newIngredients    : [Ingredient] = [];
  let allIngredients    : [Ingredient] = [];

  let categories : [{ name : Text }] = [];

  // ─── NEW Stable State ─────────────────────────────────────────────────────

  stable var globalRecords    : [DailyRecord]     = [];
  stable var masterRestaurants : [Restaurant]     = [];
  stable var restaurantUsers  : [RestaurantUser]  = [];
  stable var masterCategories : [MasterCategory]  = [];
  stable var rawMaterials     : [RawMaterial]     = [];
  stable var adminPassword    : Text              = "admin1234";
  stable var seeded           : Bool              = false;
  stable var seededV2         : Bool              = false;
  stable var nextId           : Nat               = 1000;
  stable var restaurantAssignments : [RestaurantAssignment] = [];

  // ─── Helpers ──────────────────────────────────────────────────────────────

  func genId() : Text {
    nextId += 1;
    Nat.toText(nextId);
  };

  // ─── Seed Default Data ────────────────────────────────────────────────────

  public func seedDefaultData() : async () {
    // Always ensure default restaurants exist if list is empty
    if (masterRestaurants.size() == 0) {
      masterRestaurants := [
        { id = "1"; name = "Andaaz" },
        { id = "2"; name = "Kai wok Express" },
      ];
    };

    // Always ensure default users exist
    let hasAndaaz = Array.find(restaurantUsers, func(u : RestaurantUser) : Bool { u.username == "andaaz" });
    let hasKaiwok = Array.find(restaurantUsers, func(u : RestaurantUser) : Bool { u.username == "kaiwok" });
    if (restaurantUsers.size() == 0) {
      restaurantUsers := [
        { username = "andaaz"; password = "andaaz123"; restaurantName = "Andaaz" },
        { username = "kaiwok"; password = "kaiwok123"; restaurantName = "Kai wok Express" },
      ];
    } else {
      switch (hasAndaaz) {
        case null {
          restaurantUsers := Array.append(restaurantUsers, [{ username = "andaaz"; password = "andaaz123"; restaurantName = "Andaaz" }]);
        };
        case _ {};
      };
      switch (hasKaiwok) {
        case null {
          restaurantUsers := Array.append(restaurantUsers, [{ username = "kaiwok"; password = "kaiwok123"; restaurantName = "Kai wok Express" }]);
        };
        case _ {};
      };
    };

    // Seed v1 categories and raw materials once
    if (not seeded) {
      seeded := true;

      if (masterCategories.size() == 0) {
        masterCategories := [
          { id = "c1"; name = "Vegetables" },
          { id = "c2"; name = "Dairy" },
          { id = "c3"; name = "Non-Veg" },
          { id = "c4"; name = "Disposable" },
          { id = "c5"; name = "Beverages" },
          { id = "c6"; name = "Others" },
        ];
      };

      if (rawMaterials.size() == 0) {
        rawMaterials := [
          { id="m1";  name="TOMATO/kg";             category="Vegetables" },
          { id="m2";  name="POTATO / kg";            category="Vegetables" },
          { id="m3";  name="CAPSICUM /kg";           category="Vegetables" },
          { id="m4";  name="CARROT/ kg";             category="Vegetables" },
          { id="m5";  name="CABBAGE /kg";            category="Vegetables" },
          { id="m6";  name="CAULIFLOWER /kg";        category="Vegetables" },
          { id="m7";  name="SPRING ONION/ kg";       category="Vegetables" },
          { id="m8";  name="RED CAPSICUM kg/gm";     category="Vegetables" },
          { id="m9";  name="YELLOW CAPSICUM kg/gm";  category="Vegetables" },
          { id="m10"; name="GREEN ZUCCINI kg/gm";    category="Vegetables" },
          { id="m11"; name="YELLOW ZUCCINI kg/gm";   category="Vegetables" },
          { id="m12"; name="RAW PAPAYA/ pcs";        category="Vegetables" },
          { id="m13"; name="STAFF VEG /kg";          category="Vegetables" },
          { id="m14"; name="LEMON /kg";              category="Vegetables" },
          { id="m15"; name="MINT /kg";               category="Vegetables" },
          { id="m16"; name="GINGER /kg";             category="Vegetables" },
          { id="m17"; name="GARLIC /kg";             category="Vegetables" },
          { id="m18"; name="BEANS/kg";               category="Vegetables" },
          { id="m19"; name="GREEN CHILLI /kg";       category="Vegetables" },
          { id="m20"; name="CORIANDER /kg";          category="Vegetables" },
          { id="m21"; name="ONION /kg";              category="Vegetables" },
          { id="m22"; name="BROKELY /kg";            category="Vegetables" },
          { id="m23"; name="BABYCORN/ pkt";          category="Vegetables" },
          { id="m24"; name="PALAK/ kg";              category="Vegetables" },
          { id="m25"; name="MILK /ltr";              category="Dairy" },
          { id="m26"; name="CREAM / ltr";            category="Dairy" },
          { id="m27"; name="BUTTER / kg,gm";         category="Dairy" },
          { id="m28"; name="SOYA CHAAP / kg";        category="Dairy" },
          { id="m29"; name="SAFAL MATAR / kg";       category="Dairy" },
          { id="m30"; name="EGG /tray";              category="Dairy" },
          { id="m31"; name="DAHI /kg";               category="Dairy" },
          { id="m32"; name="PANEER/kg";              category="Dairy" },
          { id="m33"; name="NOODLE /pkt";            category="Dairy" },
          { id="m34"; name="CHIC BREAST /kg";        category="Non-Veg" },
          { id="m35"; name="TANDOORI CHIC / pcs";    category="Non-Veg" },
          { id="m36"; name="CHIC THAI / kg";         category="Non-Veg" },
          { id="m37"; name="MUTTON BONLESS /kg";     category="Non-Veg" },
          { id="m38"; name="MUTTON CUT / kg";        category="Non-Veg" },
          { id="m39"; name="CHIC WING /kg";          category="Non-Veg" },
          { id="m40"; name="40ML CHUTNI CUP /pkt";   category="Disposable" },
          { id="m41"; name="PRINTER ROLL /no.";       category="Disposable" },
          { id="m42"; name="BUTTER PAPER /gm,kg";    category="Disposable" },
          { id="m43"; name="100ML RAITA CUP /pkt";   category="Disposable" },
          { id="m44"; name="PACKING TAPE /no.";       category="Disposable" },
          { id="m45"; name="DINNER PLATE /pkt";       category="Disposable" },
          { id="m46"; name="CARRY BAG /kg";           category="Disposable" },
          { id="m47"; name="PAPER NAPKIN /pkt";       category="Disposable" },
          { id="m48"; name="GLASS CUP /pkt";          category="Disposable" },
          { id="m49"; name="LID B. RECTANGEL /pkt";  category="Disposable" },
          { id="m50"; name="BLACK RECTANGEL /pkt";    category="Disposable" },
          { id="m51"; name="CLING FILM /roll";        category="Disposable" },
          { id="m52"; name="CHEF CAP /pkt";           category="Disposable" },
          { id="m53"; name="SILVER FOIL /roll";       category="Disposable" },
          { id="m54"; name="SILVER CONTAINER /pkt";   category="Disposable" },
          { id="m55"; name="SPOON /pkt";              category="Disposable" },
          { id="m56"; name="FORK /pkt";               category="Disposable" },
          { id="m57"; name="40ML PACKING CUP /pkt";  category="Disposable" },
          { id="m58"; name="ADD ON BOWL /pkt";        category="Disposable" },
          { id="m59"; name="SOUP SPOON /pkt";         category="Disposable" },
          { id="m60"; name="SOUP BOWL /pkt";          category="Disposable" },
          { id="m61"; name="MENU CARD /no.";           category="Disposable" },
          { id="m62"; name="COKE 330ML /case";        category="Beverages" },
          { id="m63"; name="THUMPS 330ML /case";      category="Beverages" },
          { id="m64"; name="SPRITE CAN /case";        category="Beverages" },
          { id="m65"; name="DIET COKE /case";         category="Beverages" },
          { id="m66"; name="FANTA CAN /case";         category="Beverages" },
          { id="m67"; name="PEPSI 475 /case";         category="Beverages" },
          { id="m68"; name="PEPSI 400 /case";         category="Beverages" },
          { id="m69"; name="7UP 475 /case";           category="Beverages" },
          { id="m70"; name="MIRINDA 475 /case";       category="Beverages" },
          { id="m71"; name="WATER BTL /case";         category="Beverages" },
        ];
      };
    };

    // Seed v2: Dry Store and Housekeeping categories + their raw materials
    if (not seededV2) {
      seededV2 := true;

      let hasDryStore = Array.find(masterCategories, func(c : MasterCategory) : Bool { c.name == "Dry Store" });
      switch (hasDryStore) {
        case null {
          masterCategories := Array.append(masterCategories, [{ id = "c7"; name = "Dry Store" }]);
        };
        case _ {};
      };

      let hasHousekeeping = Array.find(masterCategories, func(c : MasterCategory) : Bool { c.name == "Housekeeping" });
      switch (hasHousekeeping) {
        case null {
          masterCategories := Array.append(masterCategories, [{ id = "c8"; name = "Housekeeping" }]);
        };
        case _ {};
      };

      let hasDryStoreItems = Array.find(rawMaterials, func(m : RawMaterial) : Bool { m.category == "Dry Store" });
      switch (hasDryStoreItems) {
        case null {
          rawMaterials := Array.append(rawMaterials, [
            { id="m72";  name="ARARОТ (CORNFLOUR) /kg,gm";  category="Dry Store" },
            { id="m73";  name="AJINOMOTO /pkt";              category="Dry Store" },
            { id="m74";  name="AMCHUR POWDER /kg,gm";        category="Dry Store" },
            { id="m75";  name="ARHAR DAL /kg,gm";            category="Dry Store" },
            { id="m76";  name="ATTA /kg";                    category="Dry Store" },
            { id="m77";  name="BLACK PEPPER WHOLE /gm";      category="Dry Store" },
            { id="m78";  name="BOONDI /pkt";                 category="Dry Store" },
            { id="m79";  name="BREAD CRUMS /pkt";            category="Dry Store" },
            { id="m80";  name="CHANA DAL /kg,gm";            category="Dry Store" },
            { id="m81";  name="CHANA MASALA /pkt";           category="Dry Store" },
            { id="m82";  name="CHAAT MASALA /pkt";           category="Dry Store" },
            { id="m83";  name="KABULI CHANA (CHOLE) /kg,gm"; category="Dry Store" },
            { id="m84";  name="RED COLOR /tin";              category="Dry Store" },
            { id="m85";  name="DALCHINI /gm";                category="Dry Store" },
            { id="m86";  name="DALDA /pkt";                  category="Dry Store" },
            { id="m87";  name="DENGI MIRCH /pkt";            category="Dry Store" },
            { id="m88";  name="DHANIYA POWDER /kg,gm";       category="Dry Store" },
            { id="m89";  name="DHANIYA SABUT /kg,gm";        category="Dry Store" },
            { id="m90";  name="ELAICHI BADI /gm";            category="Dry Store" },
            { id="m91";  name="ELAICHI CHOTI /gm";           category="Dry Store" },
            { id="m92";  name="GARAM MASALA /pkt";           category="Dry Store" },
            { id="m93";  name="COCONUT POWDER /kg,gm";       category="Dry Store" },
            { id="m94";  name="GREEN CHILLY SAUCE /can 5ltr"; category="Dry Store" },
            { id="m95";  name="HALDI POWDER /gm";            category="Dry Store" },
            { id="m96";  name="HING POWDER /gm";             category="Dry Store" },
            { id="m97";  name="HONEY /btl";                  category="Dry Store" },
            { id="m98";  name="JAIFAL /gm";                  category="Dry Store" },
            { id="m99";  name="JAVITRI /gm";                 category="Dry Store" },
            { id="m100"; name="JEERA SABUT /kg,gm";          category="Dry Store" },
            { id="m101"; name="KAJU TUKRA /gm";              category="Dry Store" },
            { id="m102"; name="KALA NAMAK /kg,gm";           category="Dry Store" },
            { id="m103"; name="KALI MASOOR DAL /kg,gm";      category="Dry Store" },
            { id="m104"; name="KASTOORI METHI /gm";          category="Dry Store" },
            { id="m105"; name="KEWRA JAL /btl";              category="Dry Store" },
            { id="m106"; name="KITCHEN KING /pkt";           category="Dry Store" },
            { id="m107"; name="LONG /gm";                    category="Dry Store" },
            { id="m108"; name="MAGAJ /kg,gm";                category="Dry Store" },
            { id="m109"; name="MAIDA /kg";                   category="Dry Store" },
            { id="m110"; name="MALKA DAL /gm";               category="Dry Store" },
            { id="m111"; name="MEAT MASALA /pkt";            category="Dry Store" },
            { id="m112"; name="RED CHILLY POWDER /kg,gm";    category="Dry Store" },
            { id="m113"; name="RED CHILLY WHOLE /kg,gm";     category="Dry Store" },
            { id="m114"; name="MOONG DAL /kg,gm";            category="Dry Store" },
            { id="m115"; name="PEANUT WHITE /kg,gm";         category="Dry Store" },
            { id="m116"; name="MUSTARD OIL /btl";            category="Dry Store" },
            { id="m117"; name="RAJMA /kg,gm";                category="Dry Store" },
            { id="m118"; name="REFINED OIL /tin 15ltr";      category="Dry Store" },
            { id="m119"; name="REFINED OIL 750G /pkt";       category="Dry Store" },
            { id="m120"; name="ROOHAFZA /btl";               category="Dry Store" },
            { id="m121"; name="STAFF TEA /gm";               category="Dry Store" },
            { id="m122"; name="TATA SALT /pkt";              category="Dry Store" },
            { id="m123"; name="SOYA SAUCE /can 5ltr";        category="Dry Store" },
            { id="m124"; name="SOYABEAN BADI /kg,gm";        category="Dry Store" },
            { id="m125"; name="STAFF RICE /kg";              category="Dry Store" },
            { id="m126"; name="SUGAR /kg,gm";                category="Dry Store" },
            { id="m127"; name="TABLE RICE /kg";              category="Dry Store" },
            { id="m128"; name="TEJ PATTA /gm";               category="Dry Store" },
            { id="m129"; name="TOMATO SAUCE /can 5ltr";      category="Dry Store" },
            { id="m130"; name="URAD SABUT /kg,gm";           category="Dry Store" },
            { id="m131"; name="WHITE TIL /gm";               category="Dry Store" },
            { id="m132"; name="GREEN COLOR /tin";            category="Dry Store" },
            { id="m133"; name="YELLOW COLOR /tin";           category="Dry Store" },
            { id="m134"; name="MAYONNAISE SAUCE /pkt";       category="Dry Store" },
            { id="m135"; name="SWEET CORN /pkt";             category="Dry Store" },
            { id="m136"; name="SZECHWAN SAUCE /pkt";         category="Dry Store" },
            { id="m137"; name="STAFF DAL MIX /kg,gm";        category="Dry Store" },
            { id="m138"; name="BIRYANI RICE /kg,gm";         category="Dry Store" },
            { id="m139"; name="SAUNF /gm";                   category="Dry Store" },
            { id="m140"; name="KHADA MASALA MIX /gm";        category="Dry Store" },
          ]);
        };
        case _ {};
      };

      let hasHousekeepingItems = Array.find(rawMaterials, func(m : RawMaterial) : Bool { m.category == "Housekeeping" });
      switch (hasHousekeepingItems) {
        case null {
          rawMaterials := Array.append(rawMaterials, [
            { id="m141"; name="SURF /gm";                  category="Housekeeping" },
            { id="m142"; name="CAUSTIC SODA /kg,gm";       category="Housekeeping" },
            { id="m143"; name="SEEKH BROOM (JHADU) /pcs"; category="Housekeeping" },
            { id="m144"; name="WIPER /pcs";                category="Housekeeping" },
            { id="m145"; name="SUPLEY";                    category="Housekeeping" },
          ]);
        };
        case _ {};
      };
    };
  };

  // ─── Reset to default credentials (emergency recovery) ───────────────────

  public func resetToDefaultCredentials() : async () {
    restaurantUsers := [
      { username = "andaaz"; password = "andaaz123"; restaurantName = "Andaaz" },
      { username = "kaiwok"; password = "kaiwok123"; restaurantName = "Kai wok Express" },
    ];
    adminPassword := "admin1234";
  };

  // ─── Daily Records ────────────────────────────────────────────────────────

  public func addDailyRecord(
    meals          : [Meal],
    timestamp      : Timestamp,
    restaurantName : Text,
  ) : async Nat {
    let rec : DailyRecord = { meals; timestamp; restaurantName };
    globalRecords := Array.append(globalRecords, [rec]);
    globalRecords.size() - 1;
  };

  public query func getAllDailyRecords() : async [DailyRecord] {
    globalRecords;
  };

  // ─── Restaurants ──────────────────────────────────────────────────────────

  public query func getRestaurants() : async [Restaurant] { masterRestaurants };

  public func addRestaurant(name : Text) : async () {
    let id = genId();
    masterRestaurants := Array.append(masterRestaurants, [{ id; name }]);
  };

  public func updateRestaurant(id : Text, name : Text) : async () {
    masterRestaurants := Array.map(masterRestaurants, func(r : Restaurant) : Restaurant {
      if (r.id == id) { { id; name } } else r;
    });
  };

  public func deleteRestaurant(id : Text) : async () {
    masterRestaurants := Array.filter(masterRestaurants, func(r : Restaurant) : Bool { r.id != id });
  };

  // ─── Restaurant Users ─────────────────────────────────────────────────────

  public query func getUsers() : async [RestaurantUser] { restaurantUsers };

  public func addUser(username : Text, password : Text, restaurantName : Text) : async () {
    restaurantUsers := Array.append(restaurantUsers, [{ username; password; restaurantName }]);
  };

  public func updateUser(username : Text, password : Text, restaurantName : Text) : async () {
    restaurantUsers := Array.map(restaurantUsers, func(u : RestaurantUser) : RestaurantUser {
      if (u.username == username) { { username; password; restaurantName } } else u;
    });
  };

  public func deleteUser(username : Text) : async () {
    restaurantUsers := Array.filter(restaurantUsers, func(u : RestaurantUser) : Bool {
      u.username != username;
    });
  };

  public query func verifyUserLogin(username : Text, password : Text) : async ?Text {
    let found = Array.find(restaurantUsers, func(u : RestaurantUser) : Bool {
      u.username == username and u.password == password;
    });
    switch (found) {
      case (?u) { ?u.restaurantName };
      case null  { null };
    };
  };

  // ─── Categories ───────────────────────────────────────────────────────────

  public query func getCategories() : async [MasterCategory] { masterCategories };

  public func addCategory(name : Text) : async () {
    let id = genId();
    masterCategories := Array.append(masterCategories, [{ id; name }]);
  };

  public func updateCategory(id : Text, name : Text) : async () {
    masterCategories := Array.map(masterCategories, func(c : MasterCategory) : MasterCategory {
      if (c.id == id) { { id; name } } else c;
    });
  };

  public func deleteCategory(id : Text) : async () {
    masterCategories := Array.filter(masterCategories, func(c : MasterCategory) : Bool {
      c.id != id;
    });
  };

  // ─── Raw Materials ────────────────────────────────────────────────────────

  public query func getRawMaterials() : async [RawMaterial] { rawMaterials };

  public query func getRawMaterialsByCategory(cat : Text) : async [RawMaterial] {
    Array.filter(rawMaterials, func(m : RawMaterial) : Bool { m.category == cat });
  };

  public func addRawMaterial(name : Text, category : Text) : async () {
    let id = genId();
    rawMaterials := Array.append(rawMaterials, [{ id; name; category }]);
  };

  public func updateRawMaterial(id : Text, name : Text, category : Text) : async () {
    rawMaterials := Array.map(rawMaterials, func(m : RawMaterial) : RawMaterial {
      if (m.id == id) { { id; name; category } } else m;
    });
  };

  public func deleteRawMaterial(id : Text) : async () {
    rawMaterials := Array.filter(rawMaterials, func(m : RawMaterial) : Bool { m.id != id });
  };

  // ─── Restaurant Assignments ───────────────────────────────────────────────

  public query func getRestaurantAssignment(restaurantName : Text) : async ?RestaurantAssignment {
    Array.find(restaurantAssignments, func(a : RestaurantAssignment) : Bool {
      a.restaurantName == restaurantName;
    });
  };

  public func setRestaurantAssignment(
    restaurantName    : Text,
    allowedCategories : [Text],
    allowedItems      : [Text],
  ) : async () {
    let exists = Array.find(restaurantAssignments, func(a : RestaurantAssignment) : Bool {
      a.restaurantName == restaurantName;
    });
    let newEntry : RestaurantAssignment = { restaurantName; allowedCategories; allowedItems };
    switch (exists) {
      case null {
        restaurantAssignments := Array.append(restaurantAssignments, [newEntry]);
      };
      case _ {
        restaurantAssignments := Array.map(restaurantAssignments, func(a : RestaurantAssignment) : RestaurantAssignment {
          if (a.restaurantName == restaurantName) newEntry else a;
        });
      };
    };
  };

  // ─── Admin Password ───────────────────────────────────────────────────────

  public query func verifyAdminPassword(pwd : Text) : async Bool {
    pwd == adminPassword;
  };

  public func setAdminPassword(newPwd : Text) : async () {
    adminPassword := newPwd;
  };

  // ─── Legacy compatibility ─────────────────────────────────────────────────

  public query func getAllCategories() : async [{ name : Text }] {
    Array.map(masterCategories, func(c : MasterCategory) : { name : Text } { { name = c.name } });
  };

  public query func getIngredientsByCategory(cat : Text) : async [{ name : Text; category : Text }] {
    let filtered = Array.filter(rawMaterials, func(m : RawMaterial) : Bool { m.category == cat });
    Array.map(filtered, func(m : RawMaterial) : { name : Text; category : Text } {
      { name = m.name; category = m.category }
    });
  };
};
