import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

actor {
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
  };

  // Predefined ingredients and categories
  var categories : [Category] = [
    { name = "Vegetables" },
    { name = "Dairy" },
    { name = "Non-Veg" },
  ];

  var ingredients : [Ingredient] = [
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

  var nextDailyRecordId : Nat = 0;

  let users = Map.empty<Principal, [DailyRecord]>();

  // Add a daily record
  public shared ({ caller }) func addDailyRecord(meals : [Meal], timestamp : Timestamp) : async DailyRecordId {
    let newRecord : DailyRecord = {
      meals;
      timestamp;
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
    ingredients.filter(func(ingredient) { Text.equal(ingredient.category, category) });
  };

  public query ({ caller }) func getAllDailyRecords() : async [DailyRecord] {
    switch (users.get(caller)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    categories;
  };

  public query ({ caller }) func getCategoriesByType(categoryType : Text) : async [Category] {
    //. This function is only implemented in the backend so that it is does not manifest as a frontend error until it is fully connected to the UI.
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
