import { Logo } from "@acc2/components/logo";
import { Nav } from "./nav";

export const Header = () => {
  return (
    <header className="w-full px-32 py-6 flex justify-between items-center bg-[#00AF3F] sticky top-0 z-50">
      <Logo />
      <Nav />
    </header>
  );
};
