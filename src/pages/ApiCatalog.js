import React from "react";
import { useAuth } from "../context/AuthContext";
import { Table, Button } from "flowbite-react";
import DeleteEntityModal from "../modals/DeleteEntityModal";
import ManageAPIModal from "../modals/ManageAPIModal";
import CreateSubAPIModal from "../modals/CreateSubAPIModal";

export default function ApiCatalog({ apisList, handleUpdates }) {
  const { getToken, getProfile, logout } = useAuth();
  // console.log(apisList);
  const userInfo = getProfile();


  return (
    <div className="w-full h-full flex flex-col gap-10">
      <div className="flex flex-row items-center justify-between mb-4">
        <p className="text-2xl font-semibold dark:text-white">API Catalog</p>
        <ManageAPIModal action="Create" handleUpdates={handleUpdates} />
      </div>
      {apisList.length == 0 ? (
        <div className="flex items-center justify-center h-full w-full text-gray-500">
          <p className="text-2xl">No API Found</p>
        </div>
      ) : (
        apisList.map((api) => (
          <div key={api._id} className="mb-4">
            <div className="flex flex-row items-center bg-gray-50 dark:bg-gray-700 py-4 px-4 rounded-lg drop-shadow-sm transition duration-150 hover:drop-shadow-md justify-between mb-3">
              <p className="text-xl dark:text-white font-bold">{api.name}</p>
              <div className="flex flex-col lg:flex-row gap-4">
                <CreateSubAPIModal
                  apiID={api._id}
                  handleUpdates={handleUpdates}
                />
                {
                  (userInfo.accessLevel === 0) && (
                    <><ManageAPIModal
                      action="Edit"
                      apiID={api._id}
                      handleUpdates={handleUpdates} /><DeleteEntityModal
                        entity="API"
                        apiID={api._id}
                        handleUpdates={handleUpdates} /></>
                  )
                }
              </div>
            </div>

            {Object.keys(api.subapis).length == 0 ? (
              <p className="mx-4 my-2 text-slate-500">No Endpoints Found</p>
            ) : (
              <Table hoverable={true} className="w-full">
                <Table.Head>
                  <Table.HeadCell>Endpoint Name</Table.HeadCell>
                  <Table.HeadCell>URL</Table.HeadCell>
                  <Table.HeadCell>
                    <span className="sr-only">Edit</span>
                  </Table.HeadCell>
                </Table.Head>

                <Table.Body className="divide-y">
                  {api.subapis.map((subAPI) => (
                    <Table.Row
                      key={subAPI._id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap text-gray-900 dark:text-white">
                        {subAPI.name}
                      </Table.Cell>
                      <Table.Cell>{subAPI.url}</Table.Cell>
                      <Table.Cell className="flex flex-row-reverse gap-4">
                      {
                        (userInfo.accessLevel === 0) && (<DeleteEntityModal
                          entity={"SubAPI"}
                          apiID={api._id}
                          subApiID={subAPI._id}
                          handleUpdates={handleUpdates}
                        />)
                        }
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </div>
        ))
      )}
    </div>
  );
}
