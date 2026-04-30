import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";

/*====*/

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const shoes = useQuery(api.shoes.get);

  return <>
    {shoes && JSON.stringify(shoes)}
  </>;
}
