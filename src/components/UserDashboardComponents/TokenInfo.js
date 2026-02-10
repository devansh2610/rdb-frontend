import {Badge} from "flowbite-react";

export default function TokenInfo ({ userInfo }) {
  return (
    <div className="flex flex-col w-full md:w-fit items-center justify-center gap-4 py-8 px-10 rounded-md border bg-white dark:border-slate-500 dark:bg-slate-700 dark:text-white shadow-lg bg-opacity-75 dark:bg-opacity-75 backdrop-blur-sm dark:backdrop-blur-sm">
      <p className="text-2xl">Tokens Remaining</p>
      <p className="text-6xl font-extrabold">{userInfo.tokens}</p>
      {"requestTokens" in userInfo && (
        <Badge color="warning" size="md" className="mt-4 w-fit">
          You have requested for {userInfo.requestTokens} more tokens
        </Badge>
      )}
    </div>
  );
};