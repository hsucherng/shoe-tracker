import { NavLink } from "react-router";
import { ContentWrapper } from "./components/ui/content-wrapper";

export function SiteHeader() {
  return (
    <div className="py-4">
      <ContentWrapper>
        <NavLink to="/" className="inline-flex align-middle items-center gap-2">
          <img src="logo-dark.png" alt="" className="h-9" />

          <b>Shoes!</b>
        </NavLink>
      </ContentWrapper>
    </div>
  );
}
