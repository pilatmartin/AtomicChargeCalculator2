import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acc2/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { NavLink } from "react-router";
import LoginImg from "../../../assets/images/button-login.svg";
import { baseApiUrl } from "@acc2/api/base";

export const Nav = () => {
  const onLoginClick = () => {
    window.location.href = `${baseApiUrl}/auth/login`;
  };

  return (
    <nav className="flex gap-4 items-center text-white w-full">
      <div className="hidden gap-4 items-center justify-between text-white sm:flex w-full">
        <div className="flex gap-4 grow">
          <NavLink
            to={"/"}
            className={({ isActive }) =>
              `${isActive ? "underline" : "no-underline"} hover:underline"`
            }
          >
            Home
          </NavLink>
          <NavLink
            to={"/calculations"}
            className={({ isActive }) =>
              `${isActive ? "underline" : "no-underline"} hover:underline`
            }
          >
            Calculations
          </NavLink>
        </div>
        <button className="ml-auto" onClick={onLoginClick}>
          <img src={LoginImg} alt="Login Button" width={150} />
        </button>
      </div>
      <div className="block sm:hidden ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Menu />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-4">
            <DropdownMenuItem>
              <NavLink
                to={"/"}
                className={({ isActive }) =>
                  `${isActive ? "underline" : "no-underline"}`
                }
              >
                Home
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="relative">
              <NavLink
                to={"/calculations"}
                className={({ isActive }) =>
                  `${isActive ? "underline" : "no-underline"}`
                }
              >
                Calculations
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button>
                <img
                  src={LoginImg}
                  alt="Login Button"
                  height={10}
                  width={150}
                />
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
