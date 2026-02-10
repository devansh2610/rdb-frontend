import DeleteEntityModal from "../../modals/DeleteEntityModal";
import GenerateAPIKeyModal from "../../modals/GenerateAPIKeyModal";

export default function KeyManagement ({ userInfo, handleUpdates }) {
  return (
    <div className="flex flex-col w-full justify-center gap-4 py-8 px-4 md:px-10 bg-white dark:bg-slate-700 rounded-md border dark:border-slate-500 bg-opacity-75 dark:bg-opacity-75 backdrop-blur-sm dark:backdrop-blur-sm">
      {userInfo && "apiKey" in userInfo ? (
        <div className="flex gap-4 items-center justify-between">
          <p className="text-gray-600 dark:text-gray-200 w-3/5">
            You have a pre-existing API key. You can revoke your API key if you
            have lost your existing API key or want to generate a new one
          </p>
          <DeleteEntityModal entity="key" handleUpdates={handleUpdates} />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-200 w-1/2">
            You don't have any API key as of now
          </p>
          <GenerateAPIKeyModal handleUpdates={handleUpdates} />
        </div>
      )}
    </div>
  );
};
