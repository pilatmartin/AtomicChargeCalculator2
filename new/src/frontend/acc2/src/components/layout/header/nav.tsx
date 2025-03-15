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
import { baseApiUrl, handleApiError } from "@acc2/api/base";
import { useAuth } from "@acc2/hooks/queries/use-auth";
import { useLogoutMutation } from "@acc2/hooks/mutations/use-logout-mutation";
import { toast } from "sonner";

export const Nav = () => {
  const logoutMutation = useLogoutMutation();
  const { isAuthenticated } = useAuth();

  const onLoginClick = () => {
    window.location.href = `${baseApiUrl}/auth/login`;
  };

  const onLogoutClick = async () => {
    await logoutMutation.mutateAsync(undefined, {
      onError: (error) => toast.error(handleApiError(error)),
      onSuccess: () => toast.success("You have been successfully logged out."),
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
        {!isAuthenticated && (
          <button className="ml-auto" onClick={onLoginClick}>
            <img src={LoginImg} alt="Login Button" width={150} />
          </button>
        )}
        {isAuthenticated && <button className="hover:underline">Logout</button>}
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
            {isAuthenticated && (
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
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {!isAuthenticated && (
                <button onClick={onLoginClick}>
                  <img
                    src={LoginImg}
                    alt="Login Button"
                    height={10}
                    width={150}
                  />
                </button>
              )}
              {isAuthenticated && (
                <button onClick={onLogoutClick}>Logout</button>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
