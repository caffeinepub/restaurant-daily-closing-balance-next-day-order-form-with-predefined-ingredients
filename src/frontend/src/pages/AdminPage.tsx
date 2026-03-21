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
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type MasterCategory,
  type RawMaterial,
  type Restaurant,
  type RestaurantUser,
  addCategory,
  addRawMaterial,
  addRestaurant,
  addUser,
  deleteCategory,
  deleteRawMaterial,
  deleteRestaurant,
  deleteUser,
  getMasterCategories,
  getRawMaterials,
  getRestaurants,
  getUsers,
  initMasterData,
  setAdminPassword,
  updateCategory,
  updateRawMaterial,
  updateRestaurant,
  updateUser,
  verifyAdminPassword,
} from "../utils/masterData";

const ADMIN_SESSION_KEY = "hoshnagi_admin_session";

// ─── Restaurant Master Tab ───────────────────────────────────────────────────

function RestaurantMasterTab() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<RestaurantUser[]>([]);

  const [showRestDialog, setShowRestDialog] = useState(false);
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);
  const [restName, setRestName] = useState("");
  const [deleteRestId, setDeleteRestId] = useState<string | null>(null);

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<RestaurantUser | null>(null);
  const [uUsername, setUUsername] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRestaurants, setURestaurants] = useState<string[]>([]);
  const [deleteUsername, setDeleteUsername] = useState<string | null>(null);

  const reload = () => {
    Promise.all([getRestaurants(), getUsers()]).then(([rests, usrs]) => {
      setRestaurants(rests);
      setUsers(usrs);
    });
  };

  useEffect(() => {
    Promise.all([getRestaurants(), getUsers()]).then(([rests, usrs]) => {
      setRestaurants(rests);
      setUsers(usrs);
    });
  }, []);

  const openAddRest = () => {
    setEditingRest(null);
    setRestName("");
    setShowRestDialog(true);
  };
  const openEditRest = (r: Restaurant) => {
    setEditingRest(r);
    setRestName(r.name);
    setShowRestDialog(true);
  };
  const saveRest = async () => {
    if (!restName.trim()) return;
    try {
      if (editingRest) {
        await updateRestaurant(editingRest.id, restName.trim());
        toast.success("Restaurant updated.");
      } else {
        await addRestaurant(restName.trim());
        toast.success("Restaurant added.");
      }
      setShowRestDialog(false);
      reload();
    } catch {
      toast.error("Failed to save restaurant.");
    }
  };
  const confirmDeleteRest = async () => {
    if (!deleteRestId) return;
    try {
      await deleteRestaurant(deleteRestId);
      setDeleteRestId(null);
      toast.success("Restaurant deleted.");
      reload();
    } catch {
      toast.error("Failed to delete restaurant.");
    }
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUUsername("");
    setUPassword("");
    setURestaurants([]);
    setShowUserDialog(true);
  };
  const openEditUser = (u: RestaurantUser) => {
    setEditingUser(u);
    setUUsername(u.username);
    setUPassword(u.password);
    setURestaurants(
      u.restaurantName
        ? u.restaurantName
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    );
    setShowUserDialog(true);
  };
  const saveUser = async () => {
    if (!uUsername.trim() || !uPassword.trim() || uRestaurants.length === 0)
      return;
    try {
      if (editingUser) {
        await updateUser(
          uUsername.trim(),
          uPassword.trim(),
          uRestaurants.join(","),
        );
        toast.success("User updated.");
      } else {
        await addUser(
          uUsername.trim(),
          uPassword.trim(),
          uRestaurants.join(","),
        );
        toast.success("User added.");
      }
      setShowUserDialog(false);
      reload();
    } catch {
      toast.error("Failed to save user.");
    }
  };
  const confirmDeleteUser = async () => {
    if (!deleteUsername) return;
    try {
      await deleteUser(deleteUsername);
      setDeleteUsername(null);
      toast.success("User deleted.");
      reload();
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Restaurants</h3>
          <Button
            size="sm"
            className="gap-1"
            onClick={openAddRest}
            data-ocid="admin.restaurant.primary_button"
          >
            <Plus className="w-4 h-4" /> Add Restaurant
          </Button>
        </div>
        <Table data-ocid="admin.restaurant.table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center text-muted-foreground"
                  data-ocid="admin.restaurant.empty_state"
                >
                  No restaurants yet.
                </TableCell>
              </TableRow>
            )}
            {restaurants.map((r, idx) => (
              <TableRow
                key={r.id}
                data-ocid={`admin.restaurant.row.${idx + 1}`}
              >
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditRest(r)}
                      data-ocid={`admin.restaurant.edit_button.${idx + 1}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteRestId(r.id)}
                      data-ocid={`admin.restaurant.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">User Credentials</h3>
          <Button
            size="sm"
            className="gap-1"
            onClick={openAddUser}
            data-ocid="admin.user.primary_button"
          >
            <Plus className="w-4 h-4" /> Add User
          </Button>
        </div>
        <Table data-ocid="admin.user.table">
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                  data-ocid="admin.user.empty_state"
                >
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {users.map((u, idx) => (
              <TableRow
                key={u.username}
                data-ocid={`admin.user.row.${idx + 1}`}
              >
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell>{u.restaurantName}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditUser(u)}
                      data-ocid={`admin.user.edit_button.${idx + 1}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteUsername(u.username)}
                      data-ocid={`admin.user.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showRestDialog} onOpenChange={setShowRestDialog}>
        <DialogContent data-ocid="admin.restaurant.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingRest ? "Edit Restaurant" : "Add Restaurant"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Restaurant Name</Label>
            <Input
              value={restName}
              onChange={(e) => setRestName(e.target.value)}
              placeholder="e.g. Andaaz"
              data-ocid="admin.restaurant.input"
              onKeyDown={(e) => e.key === "Enter" && saveRest()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestDialog(false)}
              data-ocid="admin.restaurant.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveRest} data-ocid="admin.restaurant.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteRestId}
        onOpenChange={(o) => !o && setDeleteRestId(null)}
      >
        <AlertDialogContent data-ocid="admin.restaurant.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.restaurant.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRest}
              data-ocid="admin.restaurant.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent data-ocid="admin.user.dialog">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Username</Label>
              <Input
                value={uUsername}
                onChange={(e) => setUUsername(e.target.value)}
                placeholder="e.g. andaaz"
                disabled={!!editingUser}
                data-ocid="admin.user.input"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="text"
                value={uPassword}
                onChange={(e) => setUPassword(e.target.value)}
                placeholder="Password"
                data-ocid="admin.user.input"
              />
            </div>
            <div>
              <Label>Restaurants (select one or more)</Label>
              <div
                className="mt-2 space-y-2 border rounded p-3 max-h-48 overflow-y-auto"
                data-ocid="admin.user.select"
              >
                {restaurants.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`rest-${r.id}`}
                      checked={uRestaurants.includes(r.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setURestaurants((prev) => [...prev, r.name]);
                        } else {
                          setURestaurants((prev) =>
                            prev.filter((n) => n !== r.name),
                          );
                        }
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor={`rest-${r.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {r.name}
                    </label>
                  </div>
                ))}
                {restaurants.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No restaurants available. Add restaurants first.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUserDialog(false)}
              data-ocid="admin.user.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveUser} data-ocid="admin.user.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteUsername}
        onOpenChange={(o) => !o && setDeleteUsername(null)}
      >
        <AlertDialogContent data-ocid="admin.user.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove login access for this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.user.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              data-ocid="admin.user.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Raw Material Master Tab ─────────────────────────────────────────────────

function RawMaterialMasterTab() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [filterCat, setFilterCat] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingMat, setEditingMat] = useState<RawMaterial | null>(null);
  const [matName, setMatName] = useState("");
  const [matCategory, setMatCategory] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = () => {
    Promise.all([getRawMaterials(), getMasterCategories()]).then(
      ([mats, cats]) => {
        setMaterials(mats);
        setCategories(cats);
      },
    );
  };
  useEffect(() => {
    Promise.all([getRawMaterials(), getMasterCategories()]).then(
      ([mats, cats]) => {
        setMaterials(mats);
        setCategories(cats);
      },
    );
  }, []);

  const openAdd = () => {
    setEditingMat(null);
    setMatName("");
    setMatCategory("");
    setShowDialog(true);
  };
  const openEdit = (m: RawMaterial) => {
    setEditingMat(m);
    setMatName(m.name);
    setMatCategory(m.category);
    setShowDialog(true);
  };
  const save = async () => {
    if (!matName.trim() || !matCategory) return;
    try {
      if (editingMat) {
        await updateRawMaterial(editingMat.id, matName.trim(), matCategory);
        toast.success("Raw material updated.");
      } else {
        await addRawMaterial(matName.trim(), matCategory);
        toast.success("Raw material added.");
      }
      setShowDialog(false);
      reload();
    } catch {
      toast.error("Failed to save raw material.");
    }
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRawMaterial(deleteId);
      setDeleteId(null);
      toast.success("Raw material deleted.");
      reload();
    } catch {
      toast.error("Failed to delete raw material.");
    }
  };

  const displayed =
    filterCat === "all"
      ? materials
      : materials.filter((m) => m.category === filterCat);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-48" data-ocid="admin.rawmaterial.select">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="gap-1"
          onClick={openAdd}
          data-ocid="admin.rawmaterial.primary_button"
        >
          <Plus className="w-4 h-4" /> Add Raw Material
        </Button>
      </div>
      <Table data-ocid="admin.rawmaterial.table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayed.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
                data-ocid="admin.rawmaterial.empty_state"
              >
                No raw materials found.
              </TableCell>
            </TableRow>
          )}
          {displayed.map((m, idx) => (
            <TableRow key={m.id} data-ocid={`admin.rawmaterial.row.${idx + 1}`}>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell>{m.category}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(m)}
                    data-ocid={`admin.rawmaterial.edit_button.${idx + 1}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(m.id)}
                    data-ocid={`admin.rawmaterial.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-ocid="admin.rawmaterial.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingMat ? "Edit Raw Material" : "Add Raw Material"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Name</Label>
              <Input
                value={matName}
                onChange={(e) => setMatName(e.target.value)}
                placeholder="e.g. TOMATO/kg"
                data-ocid="admin.rawmaterial.input"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={matCategory} onValueChange={setMatCategory}>
                <SelectTrigger data-ocid="admin.rawmaterial.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="admin.rawmaterial.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={save} data-ocid="admin.rawmaterial.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="admin.rawmaterial.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Raw Material?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.rawmaterial.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-ocid="admin.rawmaterial.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Category Master Tab ─────────────────────────────────────────────────────

function CategoryMasterTab() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCat, setEditingCat] = useState<MasterCategory | null>(null);
  const [catName, setCatName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = () => getMasterCategories().then(setCategories);
  useEffect(() => {
    getMasterCategories().then(setCategories);
  }, []);

  const openAdd = () => {
    setEditingCat(null);
    setCatName("");
    setShowDialog(true);
  };
  const openEdit = (c: MasterCategory) => {
    setEditingCat(c);
    setCatName(c.name);
    setShowDialog(true);
  };
  const save = async () => {
    if (!catName.trim()) return;
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, catName.trim());
        toast.success("Category updated.");
      } else {
        await addCategory(catName.trim());
        toast.success("Category added.");
      }
      setShowDialog(false);
      reload();
    } catch {
      toast.error("Failed to save category.");
    }
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      setDeleteId(null);
      toast.success("Category deleted.");
      reload();
    } catch {
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          className="gap-1"
          onClick={openAdd}
          data-ocid="admin.category.primary_button"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>
      <Table data-ocid="admin.category.table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={2}
                className="text-center text-muted-foreground"
                data-ocid="admin.category.empty_state"
              >
                No categories yet.
              </TableCell>
            </TableRow>
          )}
          {categories.map((c, idx) => (
            <TableRow key={c.id} data-ocid={`admin.category.row.${idx + 1}`}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(c)}
                    data-ocid={`admin.category.edit_button.${idx + 1}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(c.id)}
                    data-ocid={`admin.category.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-ocid="admin.category.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingCat ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Category Name</Label>
            <Input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Beverages"
              data-ocid="admin.category.input"
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="admin.category.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={save} data-ocid="admin.category.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="admin.category.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.category.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-ocid="admin.category.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      const valid = await verifyAdminPassword(currentPwd);
      if (!valid) {
        setError("Current password is incorrect.");
        return;
      }
      if (newPwd.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPwd !== confirmPwd) {
        setError("New password and confirmation do not match.");
        return;
      }
      await setAdminPassword(newPwd);
      toast.success("Password updated successfully");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch {
      setError("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-1">Change Admin Password</h3>
        <p className="text-sm text-muted-foreground">
          Update the password used to access this admin panel.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="current-pwd">Current Password</Label>
          <div className="relative">
            <Input
              id="current-pwd"
              type={showCurrent ? "text" : "password"}
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Enter current password"
              data-ocid="admin.settings.input"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showCurrent ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-pwd">New Password</Label>
          <div className="relative">
            <Input
              id="new-pwd"
              type={showNew ? "text" : "password"}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="At least 6 characters"
              data-ocid="admin.settings.input"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showNew ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-pwd">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm-pwd"
              type={showConfirm ? "text" : "password"}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Repeat new password"
              data-ocid="admin.settings.input"
              className="pr-10"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p
            className="text-sm text-destructive"
            data-ocid="admin.settings.error_state"
          >
            {error}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          className="gap-2"
          data-ocid="admin.settings.submit_button"
        >
          <KeyRound className="w-4 h-4" /> Update Password
        </Button>
      </div>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Check if on mobile
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  useEffect(() => {
    if (isAuthenticated) {
      initMasterData().catch(console.error);
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setLoginError("");
    try {
      const valid = await verifyAdminPassword(password);
      if (valid) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        setIsAuthenticated(true);
        setPassword("");
      } else {
        setLoginError("Incorrect password. Please try again.");
      }
    } catch {
      setLoginError("Connection error. Please try again.");
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  if (isMobile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Desktop Only</h2>
            <p className="text-sm text-muted-foreground">
              The Admin panel is only available on desktop web browsers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Admin Panel</CardTitle>
            <CardDescription>Enter admin password to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="Enter admin password"
                  className="pr-10"
                  data-ocid="admin.login.input"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {loginError && (
                <p
                  className="text-sm text-destructive pt-1"
                  data-ocid="admin.login.error_state"
                >
                  {loginError}
                </p>
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleLogin}
              data-ocid="admin.login.submit_button"
            >
              Sign In
            </Button>
            <div className="text-center">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                data-ocid="admin.login.link"
              >
                ← Back to App
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
              <CardDescription>
                Manage restaurants, users, categories, and raw materials.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
              data-ocid="admin.sign_out.button"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="restaurants" data-ocid="admin.tab">
            <TabsList className="mb-6">
              <TabsTrigger
                value="restaurants"
                data-ocid="admin.restaurants.tab"
              >
                Restaurant Master
              </TabsTrigger>
              <TabsTrigger
                value="rawmaterials"
                data-ocid="admin.rawmaterials.tab"
              >
                Raw Material Master
              </TabsTrigger>
              <TabsTrigger value="categories" data-ocid="admin.categories.tab">
                Category Master
              </TabsTrigger>
              <TabsTrigger value="settings" data-ocid="admin.settings.tab">
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="restaurants">
              <RestaurantMasterTab />
            </TabsContent>
            <TabsContent value="rawmaterials">
              <RawMaterialMasterTab />
            </TabsContent>
            <TabsContent value="categories">
              <CategoryMasterTab />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
