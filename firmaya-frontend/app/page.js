import { redirect } from "next/navigation";

// CU-19: el usuario accede a la plataforma y el sistema muestra la pantalla de inicio de sesión.
export default function Home() {
  redirect("/login");
}
