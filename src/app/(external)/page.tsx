import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard/dispatch");
  return <>Coming Soon</>;
}
