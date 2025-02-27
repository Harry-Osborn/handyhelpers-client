import { House, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(menuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      menuItem.id !== "home" &&
      menuItem.id !== "products" &&
      menuItem.id !== "search"
        ? { category: [menuItem.id] }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    if (location.pathname.includes("listing") && currentFilter) {
      setSearchParams(new URLSearchParams(`?category=${menuItem.id}`));
    } else {
      navigate(menuItem.path);
    }
  }

  return (
    <nav className="flex flex-col lg:flex-row gap-8 lg:items-center">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          key={menuItem.id}
          onClick={() => handleNavigate(menuItem)}
          className=" text-base font-medium cursor-pointer hover:text-red-500 transition-colors"
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center">
      <Sheet
        open={openCartSheet}
        onOpenChange={(open) => setOpenCartSheet(open)}
      >
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className="relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItems?.items?.length > 0 && (
            <span className="absolute top-[-5px] right-[2px] text-xs bg-red-500 text-white rounded-full px-1 font-bold">
              {cartItems.items.length}
            </span>
          )}
          <span className="sr-only">User cart</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={cartItems?.items || []}
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-gray-800 cursor-pointer">
            <AvatarFallback className="bg-gray-800 text-white font-bold">
              {user?.userName
                ?.split(" ")
                .map((name) => name[0]?.toUpperCase())
                .join("")}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
          <DropdownMenuLabel>
            Logged in as <span className="font-bold">{user?.userName}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <UserCog className="mr-2 h-4 w-4" /> Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-500">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-gray-100 shadow-md border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link to="/shop/home" className="flex items-center gap-2">
          <House className="h-6 w-6 text-red-500" />
          <span className="text-xl font-extrabold text-red-600">
            Handy Helpers
          </span>
        </Link>

        <div className="hidden lg:flex">
          <MenuItems />
        </div>

        <div className="hidden lg:flex">
          <HeaderRightContent />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
            <div className="mt-6">
              <HeaderRightContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default ShoppingHeader;
