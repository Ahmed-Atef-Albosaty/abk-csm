import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen app-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export default Layout;
