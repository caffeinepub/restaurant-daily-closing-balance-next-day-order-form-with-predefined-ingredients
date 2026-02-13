import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  // Initialize the access control system
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

  // Predefined categories (not persistent)
  let categories : [Category] = [
    { name = "Vegetables" },
    { name = "Dairy" },
    { name = "Non-Veg" },
  ];

  // Legacy ingredients (not persistent)
  let legacyIngredients : [Ingredient] = [
    // Vegetables
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
    // Dairy
    { name = "milk"; category = "Dairy" },
    { name = "cream"; category = "Dairy" },
    { name = "butter"; category = "Dairy" },
    { name = "chaap"; category = "Dairy" },
    { name = "matar"; category = "Dairy" },
    { name = "egg"; category = "Dairy" },
    { name = "Dahi"; category = "Dairy" },
    // Non-Veg
    { name = "chicken bonless"; category = "Non-Veg" },
    { name = "tandoori chicken"; category = "Non-Veg" },
    { name = "chicken thai"; category = "Non-Veg" },
    { name = "mutton boneless"; category = "Non-Veg" },
    { name = "mutton cut"; category = "Non-Veg" },
    { name = "wings"; category = "Non-Veg" },
  ];

  // New ingredients (not persistent)
  let newIngredients : [Ingredient] = [
    // Vegetables
    { name = "BEANS"; category = "Vegetables" },
    { name = "GREEN CHILLI"; category = "Vegetables" },
    { name = "CORIANDER"; category = "Vegetables" },
    { name = "ONION"; category = "Vegetables" },
    // Dairy
    { name = "PANEER"; category = "Dairy" },
  ];

  let allIngredients = legacyIngredients.concat(newIngredients);

  var nextDailyRecordId : Nat = 0;

  let users = Map.empty<Principal, [DailyRecord]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Add a daily record
  public shared ({ caller }) func addDailyRecord(meals : [Meal], timestamp : Timestamp, restaurantName : Text) : async DailyRecordId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add daily records");
    };

    let newRecord : DailyRecord = {
      meals;
      timestamp;
      restaurantName;
    };

    switch (users.get(caller)) {
      case (null) {
        users.add(caller, [newRecord]);
      };
      case (?existingRecords) {
        users.add(caller, existingRecords.concat([newRecord]));
      };
    };

    nextDailyRecordId += 1;
    nextDailyRecordId - 1;
  };

  public query ({ caller }) func getIngredientsByCategory(category : CategoryName) : async [Ingredient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access ingredients");
    };
    allIngredients.filter(func(ingredient) { ingredient.category == category });
  };

  public query ({ caller }) func getAllDailyRecords() : async [DailyRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access daily records");
    };

    switch (users.get(caller)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access categories");
    };
    categories;
  };

  public query ({ caller }) func getCategoriesByType(categoryType : Text) : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access categories");
    };

    let allCategories = [
      { name = "Vegetables" },
      { name = "Dairy" },
      { name = "Non-Veg" },
      { name = "Spices" },
      { name = "Beverages" },
    ];
    if (categoryType == "All") { return allCategories };
    switch (categoryType) {
      case ("Veg") { [{ name = "Vegetables" }] };
      case ("Non-Veg") { [{ name = "Non-Veg" }] };
      case ("Dairy") { [{ name = "Dairy" }] };
      case ("Spices") { [{ name = "Spices" }] };
      case ("Beverages") { [{ name = "Beverages" }] };
      case (_) { [] };
    };
  };
};

