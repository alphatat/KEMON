import { Suspense } from "react";
import CartNav from "../../features/carts/components/CartNav";
import Branding from "./Branding";
import MobileSearchInput from "./MobileSearchInput";
import { SideMenu } from "./SideMenu";
import Link from "next/link"
import { Icons } from "./icons";

type Props = { adminLayout: boolean };

function MobileNavbar({ adminLayout }: Props) {
  return (
    <div className="md:hidden flex gap-x-8 justify-between items-center h-[64px]">
      <div className="flex gap-x-3 items-center">
        <SideMenu />
      </div>

      <Branding />
      
      <div className="flex justify-between gap-x-4 items-center">
      <Link href={"/wish-list"}>
        <Icons.heart className="w-4 h-4" aria-label="wishlist" />
      </Link>
        <MobileSearchInput />
      </div>
    </div>
  );
}

export default MobileNavbar;
