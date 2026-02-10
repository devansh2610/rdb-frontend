import React from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

const PlaygroundLayout = ({
    sidebar,
    mainContent,
    rightPanel,
    mobileActiveTab,
    sidebarOpen,
    className = ""
}) => {
    return (
        <>
            {/* Mobile View */}
            <div className="md:hidden h-full flex flex-col flex-1 overflow-hidden relative">
                {sidebar}
                <div className="flex flex-1 overflow-hidden">
                    <div className={`${mobileActiveTab === 'docs' ? 'flex' : 'hidden'} w-full overflow-y-auto px-4 md:px-6 py-4 pb-6 flex-col`}>
                        {mainContent}
                    </div>
                    <div className={`${mobileActiveTab === 'code' ? 'flex' : 'hidden'} w-full bg-gray-800 dark:bg-gray-900 h-full overflow-hidden flex-col border-l-0`}>
                        {rightPanel}
                    </div>
                </div>
            </div>

            {/* Desktop View with Resizable Panels */}
            <div className="hidden md:flex flex-1 overflow-hidden relative">
                <Group direction="horizontal" className="h-full">
                    {/* Sidebar Panel */}
                    <Panel
                        defaultSize="20"
                        minSize="10"
                        maxSize="30"
                        collapsible={true}
                        onCollapse={() => {
                            // Optional: notify parent if needed, or handle internal state
                        }}
                        className="border-r border-gray-200 dark:border-gray-700"
                    >
                        <div className="h-full overflow-hidden flex flex-col">
                            {sidebar}
                        </div>
                    </Panel>

                    <Separator className="w-1 bg-gray-100 hover:bg-indigo-300 dark:bg-gray-800 dark:hover:bg-indigo-700 transition-colors cursor-col-resize flex items-center justify-center translate-x-0 z-10">
                        <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </Separator>

                    {/* Main Content (Docs) Panel */}
                    <Panel defaultSize="45" minSize="30">
                        <div className="h-full overflow-y-auto px-4 md:px-6 py-4 pb-6 flex flex-col">
                            {mainContent}
                        </div>
                    </Panel>

                    <Separator className="w-1 bg-gray-100 hover:bg-indigo-300 dark:bg-gray-800 dark:hover:bg-indigo-700 transition-colors cursor-col-resize flex items-center justify-center z-10">
                        <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </Separator>

                    {/* Right Panel (Code) */}
                    <Panel defaultSize="35" minSize="20" className="bg-gray-800 dark:bg-gray-900">
                        <div className="h-full overflow-hidden flex flex-col">
                            {rightPanel}
                        </div>
                    </Panel>
                </Group>
            </div>
        </>
    );
};

export default PlaygroundLayout;
