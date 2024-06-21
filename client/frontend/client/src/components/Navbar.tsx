import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
import { cn } from "@/utils/cn";

const Navbar = ({ className }: { className?: string }) => {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Home"></MenuItem>
        <MenuItem setActive={setActive} active={active} item="Plans">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/hobby">Free</HoveredLink>
            <HoveredLink href="/individual">Basic</HoveredLink>
            <HoveredLink href="/team">Silver</HoveredLink>
            <HoveredLink href="/enterprise">Gold</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem
          setActive={setActive}
          active={active}
          item="Affilates"
        ></MenuItem>
        <MenuItem
          setActive={setActive}
          active={active}
          item="Annoucement"
        ></MenuItem>
        <MenuItem
          setActive={setActive}
          active={active}
          item="Contact Us"
        ></MenuItem>
      </Menu>
    </div>
  );
};

export default Navbar;
