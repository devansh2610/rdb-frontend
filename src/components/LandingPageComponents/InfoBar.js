import React from 'react';
import { Alert } from "flowbite-react";

export default function HeroSection({ content, setShowInfoBar }) {
  return (
    <Alert
      rounded={false}
      withBorderAccent={true}
      className="fixed w-full bg-slate-100 bottom-0 z-20 bg-opacity-75 backdrop-blur-sm dark:bg-opacity-75 dark:backdrop-blur-sm"
      onDismiss={() => setShowInfoBar(false)}
      additionalContent={
        <React.Fragment>
          <div className="mb-2 text-sm text-blue-700 dark:text-blue-800">
            {content.infoBar.message}
          </div>
        </React.Fragment>
      }
    >
      <h3 className="text-lg font-medium text-blue-700 dark:text-blue-800">
        {content.infoBar.heading}
      </h3>
    </Alert>
  );
}
