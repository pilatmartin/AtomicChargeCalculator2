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
import { useLoginMutation } from "@acc2/hooks/mutations/use-login-mutation";
import { toast } from "sonner";

export const Nav = () => {
  const loginMutation = useLoginMutation();

  const onLoginClick = async () => {
    await loginMutation.mutateAsync(void 0, {
      onError: () => toast.error("Something went wrong when trying to log in."),
    });
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
