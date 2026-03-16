import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import BackendConnectionErrorCard from "../components/BackendConnectionErrorCard";
import {
  CATEGORIES,
  PREDEFINED_INGREDIENTS,
} from "../data/predefinedIngredients";
import { useActorDiagnostics } from "../hooks/useActorDiagnostics";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddDailyRecord } from "../hooks/useQueries";
import type { IngredientEntryData } from "../types/dailyForm";
import {
  getCategoryBgColor,
  getCategoryInputBgColor,
} from "../utils/categoryColors";
import {
  formatInputDateDDMMYYYY,
  getOrderDateFromBalanceDate,
} from "../utils/dateFormat";

// ---- Types ----
interface CartItem {
  name: string;
  category: string;
  closingBalance: number;
  nextDayOrder: number;
}

export default function DailyEntryPage() {
  const addRecord = useAddDailyRecord();
  const { isActorReady, isActorLoading, hasActorError, retry } =
    useActorDiagnostics();
  const { identity } = useInternetIdentity();
  const [isSaving, setIsSaving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [balanceDate, setBalanceDate] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const navigate = useNavigate();

  // --- Step state ---
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [balanceValue, setBalanceValue] = useState("");
  const [orderValue, setOrderValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // --- Cart ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // --- View & Edit modal ---
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalEdits, setModalEdits] = useState<CartItem[]>([]);

  // --- Duplicate alert ---
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [pendingDuplicate, setPendingDuplicate] = useState<{
    existingIndex: number;
    newItem: CartItem;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const addItemButtonRef = useRef<HTMLButtonElement>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // --- Filtered ingredient suggestions ---
  const filteredIngredients =
    selectedCategory && searchText.length > 0
      ? PREDEFINED_INGREDIENTS.filter(
          (ing) =>
            ing.category === selectedCategory &&
            ing.name.toLowerCase().includes(searchText.toLowerCase()),
        )
      : [];

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSearchText("");
    setSelectedIngredient("");
    setBalanceValue("");
    setOrderValue("");
    setShowDropdown(false);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleSearchChange = (val: string) => {
    setSearchText(val);
    setSelectedIngredient("");
    setShowDropdown(val.length > 0);
  };

  const handleSelectIngredient = (name: string) => {
    setSelectedIngredient(name);
    setSearchText(name);
    setShowDropdown(false);
  };

  const handleAddItem = () => {
    if (!selectedIngredient) {
      toast.error("Please select an ingredient first.");
      return;
    }
    const bal = balanceValue !== "" ? Number.parseFloat(balanceValue) : 0;
    const ord = orderValue !== "" ? Number.parseFloat(orderValue) : 0;
    if (Number.isNaN(bal) || Number.isNaN(ord) || bal < 0 || ord < 0) {
      toast.error("Balance and Order must be valid non-negative numbers.");
      return;
    }

    if (editingIndex !== null) {
      setCartItems((prev) => {
        const updated = [...prev];
        updated[editingIndex] = {
          name: selectedIngredient,
          category: selectedCategory,
          closingBalance: bal,
          nextDayOrder: ord,
        };
        return updated;
      });
      setEditingIndex(null);
      toast.success("Item updated.");
      setSearchText("");
      setSelectedIngredient("");
      setBalanceValue("");
      setOrderValue("");
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      const exists = cartItems.findIndex((c) => c.name === selectedIngredient);
      if (exists >= 0) {
        setPendingDuplicate({
          existingIndex: exists,
          newItem: {
            name: selectedIngredient,
            category: selectedCategory,
            closingBalance: bal,
            nextDayOrder: ord,
          },
        });
        setShowDuplicateAlert(true);
      } else {
        setCartItems((prev) => [
          ...prev,
          {
            name: selectedIngredient,
            category: selectedCategory,
            closingBalance: bal,
            nextDayOrder: ord,
          },
        ]);
        toast.success("Item added.");
        setSearchText("");
        setSelectedIngredient("");
        setBalanceValue("");
        setOrderValue("");
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
  };

  const handleDuplicateConfirm = () => {
    if (!pendingDuplicate) return;
    const { existingIndex, newItem } = pendingDuplicate;
    setCartItems((prev) => {
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        closingBalance:
          updated[existingIndex].closingBalance + newItem.closingBalance,
        nextDayOrder:
          updated[existingIndex].nextDayOrder + newItem.nextDayOrder,
      };
      return updated;
    });
    toast.success("Quantities combined with existing entry.");
    setPendingDuplicate(null);
    setShowDuplicateAlert(false);
    setSearchText("");
    setSelectedIngredient("");
    setBalanceValue("");
    setOrderValue("");
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleDuplicateCancel = () => {
    setPendingDuplicate(null);
    setShowDuplicateAlert(false);
  };

  const handleEditItem = (index: number) => {
    const item = cartItems[index];
    setSelectedCategory(item.category);
    setSelectedIngredient(item.name);
    setSearchText(item.name);
    setBalanceValue(
      item.closingBalance !== 0 ? String(item.closingBalance) : "",
    );
    setOrderValue(item.nextDayOrder !== 0 ? String(item.nextDayOrder) : "");
    setEditingIndex(index);
    setShowDropdown(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setSearchText("");
      setSelectedIngredient("");
      setBalanceValue("");
      setOrderValue("");
    }
  };

  const handleOpenViewModal = () => {
    setModalEdits([...cartItems]);
    setShowViewModal(true);
  };

  const handleModalSave = () => {
    setCartItems([...modalEdits]);
    setShowViewModal(false);
    toast.success("Changes saved.");
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    retry();
    setTimeout(() => setIsRetrying(false), 1500);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save records.");
      return;
    }
    if (!restaurantName) {
      toast.error("Please select a Restaurant Name before saving.");
      return;
    }
    if (!balanceDate) {
      toast.error("Please select a Balance Date before saving.");
      return;
    }
    if (!isActorReady) {
      toast.error("Backend connection not ready. Please wait or retry.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Please add at least one ingredient before saving.");
      return;
    }

    const entries: IngredientEntryData[] = cartItems.map((item) => ({
      name: item.name,
      category: item.category,
      closingBalance: item.closingBalance,
      nextDayOrder: item.nextDayOrder,
    }));

    setIsSaving(true);
    try {
      const selectedDate = new Date(balanceDate);
      const timestamp = BigInt(selectedDate.getTime());

      await addRecord.mutateAsync({
        entries,
        timestamp,
        restaurantName,
      });

      toast.success("Daily record saved successfully!");
      setCartItems([]);
      setBalanceDate("");
      setRestaurantName("");
      setSelectedCategory("");
      setSearchText("");
      setSelectedIngredient("");
      setBalanceValue("");
      setOrderValue("");
      setEditingIndex(null);

      navigate({ to: "/history" });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save record. Please try again.";
      toast.error(errorMessage);
      console.error("Save error:", error);
      if (error && typeof error === "object" && "originalError" in error) {
        console.error("Original error:", (error as any).originalError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (hasActorError) {
    return (
      <div className="max-w-2xl mx-auto bg-yellow-50 dark:bg-yellow-950/20 min-h-screen p-4">
        <BackendConnectionErrorCard
          onRetry={handleRetry}
          isRetrying={isRetrying}
          errorMessage="Failed to initialize backend connection. Please check your network and try again."
        />
      </div>
    );
  }

  const isInitializing = isActorLoading && !isActorReady;

  return (
    <div className="max-w-2xl mx-auto bg-yellow-50 dark:bg-yellow-950/20 min-h-screen p-3 sm:p-4">
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl sm:text-2xl">
            Daily Inventory Entry
          </CardTitle>
          <CardDescription>
            Select category, search ingredient, add values — then submit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInitializing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Connecting to backend...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* ── Restaurant + Date ── */}
              <div className="bg-muted/50 p-4 rounded-lg border space-y-4">
                <div>
                  <Label
                    htmlFor="restaurantName"
                    className="text-base font-semibold"
                  >
                    Restaurant Name <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={restaurantName}
                    onValueChange={setRestaurantName}
                  >
                    <SelectTrigger
                      id="restaurantName"
                      className={`mt-2 w-full ${!restaurantName ? "border-red-300 focus:ring-red-400" : ""}`}
                      data-ocid="entry.select"
                    >
                      <SelectValue placeholder="Select restaurant (required)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Andaaz" className="text-lg font-bold">
                        Andaaz
                      </SelectItem>
                      <SelectItem
                        value="Kai wok Express"
                        className="text-lg font-bold"
                      >
                        Kai wok Express
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!restaurantName && (
                    <p className="text-xs text-red-500 mt-1">
                      Required to proceed
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="balanceDate"
                    className="text-base font-semibold"
                  >
                    Balance Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                    <Input
                      id="balanceDate"
                      type="date"
                      value={balanceDate}
                      onChange={(e) => setBalanceDate(e.target.value)}
                      className={`w-full sm:max-w-[10rem] ${!balanceDate ? "border-red-300 focus:ring-red-400" : ""}`}
                      data-ocid="entry.input"
                    />
                    {balanceDate && (
                      <span className="text-sm font-medium text-foreground">
                        {formatInputDateDDMMYYYY(balanceDate)}
                      </span>
                    )}
                  </div>
                  {!balanceDate && (
                    <p className="text-xs text-red-500 mt-1">
                      Required to proceed
                    </p>
                  )}
                  {balanceDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Order Date:{" "}
                      <span className="font-semibold text-foreground">
                        {getOrderDateFromBalanceDate(balanceDate)}
                      </span>{" "}
                      (Balance Date + 1)
                    </p>
                  )}
                </div>
              </div>

              {/* Mandatory fields warning banner */}
              {(!restaurantName || !balanceDate) && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800">
                  <span className="font-bold shrink-0">⚠</span>
                  <span>
                    Please select <strong>Restaurant Name</strong> and{" "}
                    <strong>Balance Date</strong> above before adding
                    ingredients.
                  </span>
                </div>
              )}

              {/* ── Step 1: Category Selection — Select box matching Restaurant Name style ── */}
              <div
                className={`space-y-2 ${
                  !restaurantName || !balanceDate
                    ? "opacity-40 pointer-events-none select-none"
                    : ""
                }`}
              >
                <Label className="text-base font-semibold">
                  Step 1: Select Category
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategorySelect}
                >
                  <SelectTrigger
                    className="mt-1 w-full"
                    data-ocid="category.select"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="text-lg font-bold"
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Step 2: Search & Add ── */}
              <div
                className={`rounded-lg border transition-all ${
                  selectedCategory
                    ? `${getCategoryBgColor(selectedCategory)} p-4`
                    : "p-4 bg-muted/20 border-dashed"
                }`}
              >
                <Label className="text-base font-semibold block mb-3">
                  Step 2: Search & Add
                  {selectedCategory && (
                    <>
                      {" — "}
                      <span className="font-normal italic">
                        {selectedCategory}
                      </span>
                    </>
                  )}
                </Label>

                {!selectedCategory ? (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    Select a category above to search ingredients
                  </p>
                ) : (
                  <div className="space-y-3">
                    {/* Search box with dropdown rendered ABOVE */}
                    <div className="relative">
                      {showDropdown && filteredIngredients.length > 0 && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-[#111111] border border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                          {filteredIngredients.map((ing) => (
                            <button
                              key={ing.name}
                              type="button"
                              className="w-full text-left px-4 py-3 text-sm font-bold text-white bg-[#111111] hover:bg-[#222222] transition-colors border-b border-gray-700 last:border-b-0"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectIngredient(ing.name);
                              }}
                            >
                              {ing.name}
                            </button>
                          ))}
                        </div>
                      )}
                      {showDropdown &&
                        searchText.length > 0 &&
                        filteredIngredients.length === 0 && (
                          <div className="absolute z-50 w-full bottom-full mb-1 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-md px-4 py-3 text-sm text-muted-foreground">
                            No ingredients found matching "{searchText}"
                          </div>
                        )}
                      <Input
                        ref={searchInputRef}
                        type="text"
                        inputMode="text"
                        placeholder="Type to search ingredients..."
                        value={searchText}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => {
                          if (searchText.length > 0) setShowDropdown(true);
                          // After keyboard animates in (~350ms), scroll the Add Item button into view
                          setTimeout(() => {
                            addItemButtonRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                            });
                          }, 350);
                        }}
                        onBlur={() =>
                          setTimeout(() => setShowDropdown(false), 150)
                        }
                        className={`w-full text-base ${getCategoryInputBgColor(selectedCategory)}`}
                        autoComplete="off"
                        data-ocid="entry.search_input"
                      />
                    </div>

                    {/* Selected ingredient badge */}
                    <div className="min-h-[2.25rem] flex items-center">
                      {selectedIngredient ? (
                        <div
                          className={`text-sm font-semibold px-3 py-2 rounded-md inline-block ${getCategoryInputBgColor(selectedCategory)}`}
                        >
                          ✓ {selectedIngredient}
                          {editingIndex !== null && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (editing)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No ingredient selected yet
                        </span>
                      )}
                    </div>

                    {/* Balance + Order inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium mb-1 block">
                          Balance
                        </Label>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          value={balanceValue}
                          onChange={(e) => setBalanceValue(e.target.value)}
                          className={`w-full ${getCategoryInputBgColor(selectedCategory)}`}
                          data-ocid="entry.balance.input"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">
                          Order
                        </Label>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          value={orderValue}
                          onChange={(e) => setOrderValue(e.target.value)}
                          className={`w-full ${getCategoryInputBgColor(selectedCategory)}`}
                          data-ocid="entry.order.input"
                        />
                      </div>
                    </div>

                    {/* Add Item button */}
                    <Button
                      ref={addItemButtonRef}
                      type="button"
                      className="w-full gap-2 font-bold text-lg bg-[#001a4d] hover:bg-[#00123a] text-white"
                      onClick={handleAddItem}
                      disabled={!selectedIngredient}
                      data-ocid="entry.primary_button"
                    >
                      <Plus className="w-4 h-4" />
                      {editingIndex !== null ? "Update Item" : "+ Add Item"}
                    </Button>
                  </div>
                )}
              </div>

              {/* ── Cart list ── */}
              {cartItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Added Items ({cartItems.length})
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleOpenViewModal}
                      data-ocid="entry.open_modal_button"
                    >
                      <Pencil className="w-3 h-3" />
                      View &amp; Edit
                    </Button>
                  </div>

                  <div className="rounded-lg border divide-y overflow-hidden">
                    {cartItems.map((item, idx) => (
                      <div
                        key={`${item.name}-${idx}`}
                        className={`flex items-center gap-2 px-3 py-2.5 ${getCategoryBgColor(item.category)}`}
                        data-ocid={`cart.item.${idx + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Bal:{" "}
                            <span className="font-medium text-foreground">
                              {item.closingBalance}
                            </span>
                            {" · "}
                            Order:{" "}
                            <span className="font-medium text-foreground">
                              {item.nextDayOrder}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEditItem(idx)}
                          className="p-1.5 rounded-md hover:bg-white/60 transition-colors"
                          aria-label="Edit item"
                          data-ocid={`cart.edit_button.${idx + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          className="p-1.5 rounded-md hover:bg-white/60 transition-colors"
                          aria-label="Delete item"
                          data-ocid={`cart.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cartItems.length === 0 && restaurantName && balanceDate && (
                <div
                  className="text-center py-4 text-sm text-muted-foreground border rounded-lg bg-muted/30"
                  data-ocid="cart.empty_state"
                >
                  No items added yet — search and add ingredients above
                </div>
              )}

              {/* ── Save Record button ── */}
              <div className="pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || cartItems.length === 0}
                  className="gap-2 w-full bg-[#000000] hover:bg-[#0a0a0a] text-white border border-[#111]"
                  data-ocid="entry.save_button"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Record ({cartItems.length} item
                      {cartItems.length !== 1 ? "s" : ""})
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Duplicate Entry Alert ── */}
      <AlertDialog
        open={showDuplicateAlert}
        onOpenChange={setShowDuplicateAlert}
      >
        <AlertDialogContent className="border-2 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 font-bold">
              Duplicate Entry
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-foreground">
                {pendingDuplicate?.newItem.name}
              </span>{" "}
              is already in your list. Do you want to add the quantities to the
              existing entry?
              {pendingDuplicate && (
                <span className="block mt-2 text-sm">
                  Existing — Bal:{" "}
                  {cartItems[pendingDuplicate.existingIndex]?.closingBalance ??
                    0}
                  {" · "}
                  Order:{" "}
                  {cartItems[pendingDuplicate.existingIndex]?.nextDayOrder ?? 0}
                  <br />
                  New — Bal: {pendingDuplicate.newItem.closingBalance}
                  {" · "}
                  Order: {pendingDuplicate.newItem.nextDayOrder}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDuplicateCancel}
              data-ocid="duplicate.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDuplicateConfirm}
              className="bg-red-600 hover:bg-red-700"
              data-ocid="duplicate.confirm_button"
            >
              Combine Quantities
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── View & Edit Modal ── */}
      <Dialog
        open={showViewModal}
        onOpenChange={setShowViewModal}
        data-ocid="entry.dialog"
      >
        <DialogContent className="max-w-lg w-[96vw] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>View &amp; Edit Items</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
            {modalEdits.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No items added yet.
              </p>
            )}
            {modalEdits.map((item, idx) => (
              <div
                key={`modal-${item.name}-${idx}`}
                className={`rounded-lg border px-3 py-3 space-y-2 ${getCategoryBgColor(item.category)}`}
              >
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">Balance</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={modalEdits[idx].closingBalance || ""}
                      placeholder="0"
                      onChange={(e) => {
                        const val =
                          e.target.value !== ""
                            ? Number.parseFloat(e.target.value)
                            : 0;
                        setModalEdits((prev) => {
                          const updated = [...prev];
                          updated[idx] = {
                            ...updated[idx],
                            closingBalance: val,
                          };
                          return updated;
                        });
                      }}
                      className={`h-8 text-sm ${getCategoryInputBgColor(item.category)}`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Order</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={modalEdits[idx].nextDayOrder || ""}
                      placeholder="0"
                      onChange={(e) => {
                        const val =
                          e.target.value !== ""
                            ? Number.parseFloat(e.target.value)
                            : 0;
                        setModalEdits((prev) => {
                          const updated = [...prev];
                          updated[idx] = { ...updated[idx], nextDayOrder: val };
                          return updated;
                        });
                      }}
                      className={`h-8 text-sm ${getCategoryInputBgColor(item.category)}`}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setModalEdits((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                  data-ocid={`modal.delete_button.${idx + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowViewModal(false)}
              data-ocid="entry.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleModalSave}
              data-ocid="entry.confirm_button"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
