import { Outlet } from "react-router";
import Header from "../components/govassist/Header";
import Footer from "../components/govassist/Footer";

export default function MainLayout() {
  return (
    <>
      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}