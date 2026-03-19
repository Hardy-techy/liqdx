import { Outlet } from "react-router-dom";
import { Header, Footer } from "@sections";

const Layout = () => {
  return (
    <div className="min-h-screen bg-surface-0">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;