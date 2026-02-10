import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons";

export default function AuthorizationPage({ children }) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-signup bg-cover bg-center bg-no-repeat">
      <div className="fixed inset-0 w-full h-full backdrop-blur-sm backdrop-brightness-50 backdrop-contrast-95">
        <div className="fixed inset-0 w-full h-full dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center">
          <div className="relative max-h-screen overflow-auto py-6 flex items-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
