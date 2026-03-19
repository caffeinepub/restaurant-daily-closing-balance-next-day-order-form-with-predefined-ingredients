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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import BackendConnectionErrorCard from "../components/BackendConnectionErrorCard";
import { useActorDiagnostics } from "../hooks/useActorDiagnostics";
import { useAddDailyRecord, useGetAllDailyRecords } from "../hooks/useQueries";
import { useRestaurantSession } from "../hooks/useRestaurantSession";
import type { IngredientEntryData } from "../types/dailyForm";
import {
  formatInputDateDDMMYYYY,
  getOrderDateFromBalanceDate,
} from "../utils/dateFormat";
import {
  getMasterCategories,
  getRawMaterialsByCategory,
} from "../utils/masterData";

// ---- Types ----
interface CartItem {
  name: string;
  category: string;
  closingBalance: number;
  nextDayOrder: number;
}

export default function DailyEntryPage() {
  const { session } = useRestaurantSession();
  const navigate = useNavigate();
  const addRecord = useAddDailyRecord();
  const { data: allRecords } = useGetAllDailyRecords();
  const { isActorReady, isActorLoading, hasActorError, retry } =
    useActorDiagnostics();

  const [isSaving, setIsSaving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [balanceDate, setBalanceDate] = useState("");

  // Dynamic categories/ingredients from masterData
  const [categories, setCategories] = useState<string[]>([]);

  // Step state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [balanceValue, setBalanceValue] = useState("");
  const [orderValue, setOrderValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // View & Edit modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalEdits, setModalEdits] = useState<CartItem[]>([]);

  // Duplicate alert
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [pendingDuplicate, setPendingDuplicate] = useState<{
    existingIndex: number;
    newItem: CartItem;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const addItemButtonRef = useRef<HTMLButtonElement>(null);
  const balanceInputRef = useRef<HTMLInputElement>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if no session
  useEffect(() => {
    if (!session) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  // Load categories from masterData
  useEffect(() => {
    const cats = getMasterCategories().map((c) => c.name);
    setCategories(cats);
  }, []);

  if (!session) return null;

  const restaurantName = session.restaurantName;

  // Filtered ingredient suggestions from masterData
  const filteredIngredients =
    selectedCategory && searchText.length > 0
      ? getRawMaterialsByCategory(selectedCategory).filter((m) =>
          m.name.toLowerCase().includes(searchText.toLowerCase()),
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

    // Per-restaurant per-category per-day restriction
    if (allRecords && allRecords.length > 0) {
      const balanceDateFormatted = formatInputDateDDMMYYYY(balanceDate);
      const categoriesInCart = [
        ...new Set(cartItems.map((item) => item.category)),
      ];

      for (const category of categoriesInCart) {
        const conflict = allRecords.find((record) => {
          if (record.restaurantName !== restaurantName) return false;
          const recordDate = formatInputDateDDMMYYYY(
            new Date(Number(record.timestamp)).toISOString().split("T")[0],
          );
          if (recordDate !== balanceDateFormatted) return false;
          return record.entries.some((e) => e.category === category);
        });
        if (conflict) {
          toast.error(
            `Entry already exists for ${restaurantName} - ${category} on this date.`,
          );
          return;
        }
      }
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

      toast.success("Record saved successfully!");
      setCartItems([]);
      setBalanceDate("");
      setSelectedCategory("");
      setSearchText("");
      setSelectedIngredient("");
      setBalanceValue("");
      setOrderValue("");
      navigate({ to: "/history" });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to save record. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isStepDisabled = !balanceDate;
  const orderDate = balanceDate ? getOrderDateFromBalanceDate(balanceDate) : "";

  if (hasActorError) {
    return (
      <div className="max-w-2xl mx-auto">
        <BackendConnectionErrorCard
          onRetry={handleRetry}
          isRetrying={isRetrying}
          errorMessage="Failed to initialize backend connection. Please check your network and try again."
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Daily Entry</CardTitle>
          <CardDescription>
            Restaurant: <strong>{restaurantName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 0: Balance Date */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="balance-date" className="text-sm font-semibold">
              Balance Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="balance-date"
              type="date"
              value={balanceDate}
              onChange={(e) => setBalanceDate(e.target.value)}
              className="w-full sm:w-56"
              data-ocid="entry.date.input"
            />
            {orderDate && (
              <p className="text-xs text-muted-foreground">
                Order Date: <strong>{orderDate}</strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 1+2: Category & Ingredient Search */}
      <Card className={isStepDisabled ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="text-base">Step 1: Select Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Select */}
          <div>
            <Label className="text-sm font-semibold mb-1 block">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={handleCategorySelect}
              disabled={isStepDisabled}
            >
              <SelectTrigger
                className="w-full"
                data-ocid="entry.category.select"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Search & Add */}
          {selectedCategory && (
            <div>
              <CardTitle className="text-base mb-3">
                Step 2: Search &amp; Add
              </CardTitle>

              {/* Fixed Balance/Order inputs */}
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <Label className="text-xs font-semibold">Balance</Label>
                  <Input
                    ref={balanceInputRef}
                    type="number"
                    inputMode="decimal"
                    value={balanceValue}
                    onChange={(e) => setBalanceValue(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="any"
                    data-ocid="entry.balance.input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        orderInputRef.current?.focus();
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-semibold">Order</Label>
                  <Input
                    ref={orderInputRef}
                    type="number"
                    inputMode="decimal"
                    value={orderValue}
                    onChange={(e) => setOrderValue(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="any"
                    data-ocid="entry.order.input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                  />
                </div>
              </div>

              {/* Search with results ABOVE */}
              <div className="relative">
                {showDropdown && filteredIngredients.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-950 border border-gray-800 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
                    {filteredIngredients.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-white font-bold text-sm hover:bg-gray-800 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectIngredient(m.name);
                        }}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
                <Input
                  ref={searchInputRef}
                  value={searchText}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchText.length > 0 && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  placeholder="Type to search ingredient..."
                  data-ocid="entry.search.input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (
                        filteredIngredients.length > 0 &&
                        !selectedIngredient
                      ) {
                        handleSelectIngredient(filteredIngredients[0].name);
                      } else {
                        balanceInputRef.current?.focus();
                      }
                    }
                  }}
                />
              </div>

              {/* Add Item Button */}
              <Button
                ref={addItemButtonRef}
                onClick={handleAddItem}
                className="w-full mt-3 bg-navy-700 hover:bg-navy-800 text-white font-bold text-base gap-2"
                style={{ background: "#1a3a5c" }}
                data-ocid="entry.add.primary_button"
                onFocus={() =>
                  addItemButtonRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                  })
                }
              >
                <Plus className="w-4 h-4" />
                {editingIndex !== null ? "Update Item" : "+ Add Item"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cart */}
      {cartItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Cart ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                )
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenViewModal}
                data-ocid="entry.view_edit.button"
              >
                View &amp; Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cartItems.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                  data-ocid={`entry.cart.item.${idx + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.category} · Bal: {item.closingBalance} · Ord:{" "}
                      {item.nextDayOrder}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditItem(idx)}
                    data-ocid={`entry.cart.edit_button.${idx + 1}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(idx)}
                    data-ocid={`entry.cart.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              className="w-full mt-4 gap-2 font-bold"
              style={{ background: "#111", color: "white" }}
              onClick={handleSave}
              disabled={isSaving || isActorLoading}
              data-ocid="entry.save.primary_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Record
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Duplicate Alert */}
      <AlertDialog
        open={showDuplicateAlert}
        onOpenChange={setShowDuplicateAlert}
      >
        <AlertDialogContent
          className="border-2 border-destructive"
          data-ocid="entry.duplicate.modal"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Entry</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingDuplicate?.newItem.name}</strong> is already in
              your cart. Combine the quantities?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDuplicateCancel}
              data-ocid="entry.duplicate.cancel_button"
            >
              Keep Separate
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDuplicateConfirm}
              data-ocid="entry.duplicate.confirm_button"
            >
              Combine
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View & Edit Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent
          className="max-w-lg max-h-[80vh] overflow-y-auto"
          data-ocid="entry.viewedit.dialog"
        >
          <DialogHeader>
            <DialogTitle>Review Cart</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {modalEdits.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="p-3 rounded-lg border border-border space-y-2"
              >
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.category}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Balance</Label>
                    <Input
                      type="number"
                      value={modalEdits[idx].closingBalance}
                      onChange={(e) => {
                        const updated = [...modalEdits];
                        updated[idx] = {
                          ...updated[idx],
                          closingBalance: Number(e.target.value),
                        };
                        setModalEdits(updated);
                      }}
                      data-ocid={`entry.viewedit.balance.input.${idx + 1}`}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Order</Label>
                    <Input
                      type="number"
                      value={modalEdits[idx].nextDayOrder}
                      onChange={(e) => {
                        const updated = [...modalEdits];
                        updated[idx] = {
                          ...updated[idx],
                          nextDayOrder: Number(e.target.value),
                        };
                        setModalEdits(updated);
                      }}
                      data-ocid={`entry.viewedit.order.input.${idx + 1}`}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-5"
                    onClick={() =>
                      setModalEdits((prev) => prev.filter((_, i) => i !== idx))
                    }
                    data-ocid={`entry.viewedit.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowViewModal(false)}
              className="flex-1"
              data-ocid="entry.viewedit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleModalSave}
              className="flex-1"
              data-ocid="entry.viewedit.save_button"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
