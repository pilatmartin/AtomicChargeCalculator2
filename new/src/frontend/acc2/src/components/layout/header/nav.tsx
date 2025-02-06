import { NavLink } from "react-router";

export const Nav = () => {
  return (
    <nav className="flex gap-4 items-center text-white">
      <NavLink
        to={"/"}
        className={({ isActive }) =>
          `${isActive ? "underline" : "no-underline"} hover:underline`
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
    </nav>
  );
};
