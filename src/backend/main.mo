import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Keep accessControlState stable var to maintain upgrade compatibility
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type CategoryName = Text;
  type Timestamp = Nat;
  type DailyRecordId = Nat;

  type Ingredient = {
    name : Text;
    category : CategoryName;
  };

  type Category = {
    name : CategoryName;
  };

  type Meal = {
    name : Text;
    ingredients : [Ingredient];
  };

  type DailyRecord = {
    meals : [Meal];
    timestamp : Timestamp;
    restaurantName : Text;
  };

  // User profile type
  public type UserProfile = {
    name : Text;
    restaurantName : Text;
  };

  // Keep categories stable var to maintain upgrade compatibility
  let categories : [Category] = [
    { name = "Vegetables" },
    { name = "Dairy" },
    { name = "Non-Veg" },
  ];

  // Legacy ingredients
  let legacyIngredients : [Ingredient] = [
    { name = "Tomat"; category = "Vegetables" },
    { name = "Poatao"; category = "Vegetables" },
    { name = "Capsicum"; category = "Vegetables" },
    { name = "Carrot"; category = "Vegetables" },
    { name = "cabbage"; category = "Vegetables" },
    { name = "cauliflower"; category = "Vegetables" },
    { name = "spring onion"; category = "Vegetables" },
    { name = "red capsicum"; category = "Vegetables" },
    { name = "yellow capsicum"; category = "Vegetables" },
    { name = "green zuccini"; category = "Vegetables" },
    { name = "yellow zuccini"; category = "Vegetables" },
    { name = "raw papya"; category = "Vegetables" },
    { name = "staff vegetable"; category = "Vegetables" },
    { name = "lemon"; category = "Vegetables" },
    { name = "mint"; category = "Vegetables" },
    { name = "ginger"; category = "Vegetables" },
    { name = "garlic"; category = "Vegetables" },
    { name = "milk"; category = "Dairy" },
    { name = "cream"; category = "Dairy" },
    { name = "butter"; category = "Dairy" },
    { name = "chaap"; category = "Dairy" },
    { name = "matar"; category = "Dairy" },
    { name = "egg"; category = "Dairy" },
    { name = "Dahi"; category = "Dairy" },
    { name = "chicken bonless"; category = "Non-Veg" },
    { name = "tandoori chicken"; category = "Non-Veg" },
    { name = "chicken thai"; category = "Non-Veg" },
    { name = "mutton boneless"; category = "Non-Veg" },
    { name = "mutton cut"; category = "Non-Veg" },
    { name = "wings"; category = "Non-Veg" },
  ];

  let newIngredients : [Ingredient] = [
    { name = "BEANS"; category = "Vegetables" },
    { name = "GREEN CHILLI"; category = "Vegetables" },
    { name = "CORIANDER"; category = "Vegetables" },
    { name = "ONION"; category = "Vegetables" },
    { name = "BROKELY /kg"; category = "Vegetables" },
    { name = "BABYCORN/ pkt"; category = "Vegetables" },
    { name = "PALAK/ kg"; category = "Vegetables" },
    { name = "PANEER"; category = "Dairy" },
    { name = "NOODLE /pkt"; category = "Dairy" },
  ];

  let allIngredients = legacyIngredients.concat(newIngredients);

  var nextDailyRecordId : Nat = 0;

  let users = Map.empty<Principal, [DailyRecord]>();
  var globalRecords : [DailyRecord] = [];
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Add a daily record — no permission check (auth handled by frontend username/password)
  public shared ({ caller }) func addDailyRecord(
    meals : [Meal],
    timestamp : Timestamp,
    restaurantName : Text,
  ) : async Nat {
    let newRecord : DailyRecord = {
      meals;
      timestamp;
      restaurantName;
    };

    switch (users.get(caller)) {
      case (null) { users.add(caller, [newRecord]) };
      case (?existingRecords) {
        users.add(caller, existingRecords.concat([newRecord]))
      };
    };

    globalRecords := globalRecords.concat([newRecord]);
    nextDailyRecordId += 1;
    nextDailyRecordId - 1;
  };

  public query func getIngredientsByCategory(category : CategoryName) : async [Ingredient] {
    allIngredients.filter(func(ingredient) { ingredient.category == category });
  };

  // Returns ALL daily records — visible to any caller (auth on frontend)
  public query func getAllDailyRecords() : async [DailyRecord] {
    if (globalRecords.size() > 0) {
      return globalRecords;
    };
    var migrated : [DailyRecord] = [];
    for ((_, userRecords) in users.entries()) {
      migrated := migrated.concat(userRecords);
    };
    migrated;
  };

  public query func getAllCategories() : async [Category] {
    [
      { name = "Vegetables" },
      { name = "Dairy" },
      { name = "Non-Veg" },
      { name = "Disposable" },
      { name = "Beverages" },
      { name = "Others" },
    ];
  };

  public query func getCategoriesByType(categoryType : Text) : async [Category] {
    let allCategories : [Category] = [
      { name = "Vegetables" },
      { name = "Dairy" },
      { name = "Non-Veg" },
      { name = "Disposable" },
      { name = "Beverages" },
      { name = "Others" },
    ];
    if (categoryType == "All") { return allCategories };
    switch (categoryType) {
      case ("Veg") { [{ name = "Vegetables" }] };
      case ("Non-Veg") { [{ name = "Non-Veg" }] };
      case ("Dairy") { [{ name = "Dairy" }] };
      case ("Beverages") { [{ name = "Beverages" }] };
      case ("Disposable") { [{ name = "Disposable" }] };
      case (_) { [] };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };
};
