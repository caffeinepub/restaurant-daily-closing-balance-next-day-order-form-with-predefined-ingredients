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
import {
  Loader2,
  LogIn,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
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
  updateCategory,
  updateRawMaterial,
  updateRestaurant,
  updateUser,
} from "../utils/masterData";

// ─── Restaurant Master Tab ───────────────────────────────────────────────────

function RestaurantMasterTab() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<RestaurantUser[]>([]);

  // Add/Edit Restaurant
  const [showRestDialog, setShowRestDialog] = useState(false);
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);
  const [restName, setRestName] = useState("");

  // Delete Restaurant
  const [deleteRestId, setDeleteRestId] = useState<string | null>(null);

  // Add/Edit User
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<RestaurantUser | null>(null);
  const [uUsername, setUUsername] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRestaurant, setURestaurant] = useState("");

  // Delete User
  const [deleteUsername, setDeleteUsername] = useState<string | null>(null);

  const reload = () => {
    setRestaurants(getRestaurants());
    setUsers(getUsers());
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setRestaurants(getRestaurants());
    setUsers(getUsers());
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

  const saveRest = () => {
    if (!restName.trim()) return;
    if (editingRest) {
      updateRestaurant(editingRest.id, restName.trim());
      toast.success("Restaurant updated.");
    } else {
      addRestaurant(restName.trim());
      toast.success("Restaurant added.");
    }
    setShowRestDialog(false);
    reload();
  };

  const confirmDeleteRest = () => {
    if (!deleteRestId) return;
    deleteRestaurant(deleteRestId);
    setDeleteRestId(null);
    toast.success("Restaurant deleted.");
    reload();
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUUsername("");
    setUPassword("");
    setURestaurant("");
    setShowUserDialog(true);
  };

  const openEditUser = (u: RestaurantUser) => {
    setEditingUser(u);
    setUUsername(u.username);
    setUPassword(u.password);
    setURestaurant(u.restaurantName);
    setShowUserDialog(true);
  };

  const saveUser = () => {
    if (!uUsername.trim() || !uPassword.trim() || !uRestaurant) return;
    if (editingUser) {
      updateUser(uUsername.trim(), uPassword.trim(), uRestaurant);
      toast.success("User updated.");
    } else {
      addUser(uUsername.trim(), uPassword.trim(), uRestaurant);
      toast.success("User added.");
    }
    setShowUserDialog(false);
    reload();
  };

  const confirmDeleteUser = () => {
    if (!deleteUsername) return;
    deleteUser(deleteUsername);
    setDeleteUsername(null);
    toast.success("User deleted.");
    reload();
  };

  return (
    <div className="space-y-8">
      {/* Restaurants */}
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

      {/* User Credentials */}
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

      {/* Restaurant Dialog */}
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

      {/* Delete Restaurant Confirm */}
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

      {/* User Dialog */}
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
              <Label>Restaurant</Label>
              <Select value={uRestaurant} onValueChange={setURestaurant}>
                <SelectTrigger data-ocid="admin.user.select">
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((r) => (
                    <SelectItem key={r.id} value={r.name}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Delete User Confirm */}
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
    setMaterials(getRawMaterials());
    setCategories(getMasterCategories());
  };

  useEffect(() => {
    setMaterials(getRawMaterials());
    setCategories(getMasterCategories());
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

  const save = () => {
    if (!matName.trim() || !matCategory) return;
    if (editingMat) {
      updateRawMaterial(editingMat.id, matName.trim(), matCategory);
      toast.success("Raw material updated.");
    } else {
      addRawMaterial(matName.trim(), matCategory);
      toast.success("Raw material added.");
    }
    setShowDialog(false);
    reload();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteRawMaterial(deleteId);
    setDeleteId(null);
    toast.success("Raw material deleted.");
    reload();
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

  const reload = () => setCategories(getMasterCategories());

  useEffect(() => {
    setCategories(getMasterCategories());
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

  const save = () => {
    if (!catName.trim()) return;
    if (editingCat) {
      updateCategory(editingCat.id, catName.trim());
      toast.success("Category updated.");
    } else {
      addCategory(catName.trim());
      toast.success("Category added.");
    }
    setShowDialog(false);
    reload();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteCategory(deleteId);
    setDeleteId(null);
    toast.success("Category deleted.");
    reload();
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

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const isLoggingIn = loginStatus === "logging-in";
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Check if on mobile (PWA standalone)
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  useEffect(() => {
    if (!isAuthenticated || !actor) {
      setIsAdmin(null);
      return;
    }
    actor
      .isCallerAdmin()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, [isAuthenticated, actor]);

  useEffect(() => {
    if (isAdmin === true) {
      initMasterData();
    }
  }, [isAdmin]);

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
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>
              Sign in with Internet Identity to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="gap-2"
              data-ocid="admin.sign_in.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In with Internet Identity
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2
          className="w-8 h-8 animate-spin text-muted-foreground"
          data-ocid="admin.loading_state"
        />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              Your Internet Identity does not have admin privileges.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <CardDescription>
            Manage restaurants, users, categories, and raw materials.
          </CardDescription>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
