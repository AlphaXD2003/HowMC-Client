import Navbar from "@/components/Navbar";
import { ModeToggle } from "@/components/mode-toggle";
import Footer from "@/shared/Footer";
import Header from "@/shared/Header";
import { Button } from "@/components/ui/button";
import { Outlet } from "react-router-dom";
import { ArrowRight, AlignJustify } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spotlight } from "@/components/ui/Spotlight";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

interface RouterOption {
  name: string;
  path: string;
  children?: RouterOption[];
}

const routerOption: RouterOption[] = [
  { name: "Home", path: "/" },
  {
    name: "Plans",
    path: "/plans",
    children: [
      { name: "Free", path: "/free" },
      { name: "Basic", path: "/basic" },
      { name: "Silver", path: "/silver" },
      { name: "Gold", path: "/gold" },
    ],
  },
  { name: "Affilates", path: "/affilates" },
  { name: "Annoucement", path: "/announcement" },
];

const Layout = () => {
  return (
    <div className="mt-6">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="blue" />
      <div className=" w-full flex items-center justify-center gap-4 lg:gap-8">
        <div className="block lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <AlignJustify className="block lg:hidden" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="text-[var(--primary-color)] dark:text-[var(--secondary-color)]">
                <SheetTitle>How2MC GSM</SheetTitle>
                <SheetDescription>
                  <p className="  text-[var(--primary-color)] dark:text-[var(--secondary-color)]">
                    How2MC GSM is a Game Server Management System that allows
                    you to manage your game servers easily.
                  </p>
                </SheetDescription>
              </SheetHeader>
              <div>
                {routerOption.map((item) => (
                  <div key={item.name}>
                    <Button variant="outline" className="w-full mt-3">
                      {item.name}
                    </Button>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Header className="roboto-slab-900 text-xl w-full lg:text-3xl uppercase dark:text-[var(--secondary-color)] light:text-[var(--primary-color)]" />

        <div className="relative w-full flex items-center justify-center">
          <Navbar className="hidden lg:block md:top-2 lg:top-6" />
          <p className="text-black dark:text-white"></p>
        </div>

        <ModeToggle />

        <HoverBorderGradient
          as="button"
          className="dark:bg-transparent w-[150px] bg-white text-black dark:text-white flex text-center items-center space-x-2"
          containerClassName="rounded-full"
        >
          Client Area &nbsp;
          <ArrowRight />
        </HoverBorderGradient>
        <div className="lg:mx-6 mx-4 "></div>
      </div>
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
