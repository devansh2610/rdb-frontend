import React, { useState } from 'react';
import { 
  HiStar, 
  HiOutlineStar, 
  HiTrash, 
  HiReply, 
  HiDotsVertical,
  HiOutlineSearch,
  HiCheck,
  HiX,
  HiRefresh,
  HiMailOpen,
  HiMail,
  HiPhone,
  HiOfficeBuilding,
  HiOutlineDocumentText,
  HiExclamationCircle
} from 'react-icons/hi';
import { Modal, Button } from 'flowbite-react';
import { deleteContact, bulkDeleteContacts, deleteDeveloperContact, bulkDeleteDeveloperContacts } from '../../api/adminService';

const EmailInbox = ({ 
  title, 
  emails, 
  setEmails, 
  onReply, 
  onUpdateEmail, 
  emailType,
  // Pagination props
  currentPage = 1,
  setCurrentPage,
  pageSize = 20,
  setPageSize,
  totalEmails = 0,
  totalPages = 0,
  isServerSidePagination = false
}) => {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [activeEmail, setActiveEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailsToDelete, setEmailsToDelete] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  
  const toggleSelectEmail = (id) => {
    if (selectedEmails.includes(id)) {
      setSelectedEmails(selectedEmails.filter(emailId => emailId !== id));
    } else {
      setSelectedEmails([...selectedEmails, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(email => email.id));
    }
  };

  const markAsRead = (ids) => {
    if (onUpdateEmail) {
      ids.forEach(id => {
        const email = emails.find(e => e.id === id);
        if (email && !email.read) {
          onUpdateEmail(email._id || email.id, { read: true });
        }
      });
    } else {
      setEmails(emails.map(email => 
        ids.includes(email.id) ? { ...email, read: true } : email
      ));
    }
    setSelectedEmails([]);
  };

  const markAsUnread = (ids) => {
    if (onUpdateEmail) {
      ids.forEach(id => {
        const email = emails.find(e => e.id === id);
        if (email && email.read) {
          onUpdateEmail(email._id || email.id, { read: false });
        }
      });
    } else {
      setEmails(emails.map(email => 
        ids.includes(email.id) ? { ...email, read: false } : email
      ));
    }
    setSelectedEmails([]);
  };

  const toggleImportance = (id) => {
    const email = emails.find(e => e.id === id);
    if (!email) return;
    
    if (onUpdateEmail) {
      onUpdateEmail(email._id || email.id, { important: !email.important });
    } else {
      setEmails(emails.map(email => 
        email.id === id ? { ...email, important: !email.important } : email
      ));
    }
  };

  const showDeleteConfirmation = (ids) => {
    setEmailsToDelete(ids);
    setShowDeleteModal(true);
  };

  const determineEmailType = () => {
    if (emailType) {
      return emailType;
    }
    
    const titleLower = title?.toLowerCase() || '';
    if (titleLower.includes('subscription') || titleLower.includes('developer')) {
      return 'subscription';
    } else if (titleLower.includes('inquiry') || titleLower.includes('contact')) {
      return 'inquiry';
    }
    
    console.warn('Email type not specified, defaulting to inquiry');
    return 'inquiry';
  };

  const confirmDelete = async () => {
    if (emailsToDelete.length === 0) return;
    
    const effectiveEmailType = determineEmailType();
    
    try {
      setIsDeleting(true);
      
      if (emailsToDelete.length === 1) {
        const emailId = emailsToDelete[0];
        const email = emails.find(e => e.id === emailId);
        if (!email) {
          console.error('Email not found with id:', emailId);
          return;
        }
        
        const mongoId = String(email._id);
        
        if (!mongoId) {
          console.error('Cannot delete email: Missing _id property', email);
          return;
        }
        
        let success = false;
        
        if (effectiveEmailType === 'subscription') {
          try {
            const response = await deleteDeveloperContact(mongoId);
            success = response && response.success;
          } catch (error) {
            console.error('Error deleting developer contact:', error);
            throw error;
          }
        } else {
          try {
            const response = await deleteContact(mongoId);
            success = response && response.success;
          } catch (error) {
            console.error('Error deleting contact:', error);
            throw error;
          }
        }
        
        if (!success) {
          throw new Error('Failed to delete message');
        }
      } else {
        const mongoIds = [];
        
        for (const localId of emailsToDelete) {
          const email = emails.find(e => e.id === localId);
          if (email && email._id) {
            mongoIds.push(String(email._id));
          }
        }
        
        
        if (mongoIds.length === 0) {
          console.error('Cannot delete emails: No valid _id properties found');
          return;
        }
        
        let success = false;
        
        if (effectiveEmailType === 'subscription') {
          try {
            const response = await bulkDeleteDeveloperContacts(mongoIds);
            success = response && response.success;
          } catch (error) {
            console.error('Error bulk deleting developer contacts:', error);
            throw error;
          }
        } else {
          try {
            const response = await bulkDeleteContacts(mongoIds);
            success = response && response.success;
          } catch (error) {
            console.error('Error bulk deleting contacts:', error);
            throw error;
          }
        }
        
        if (!success) {
          throw new Error('Failed to delete messages');
        }
      }
      
      setEmails(prevEmails => prevEmails.filter(email => !emailsToDelete.includes(email.id)));
      
      setSelectedEmails([]);
      
      if (activeEmail && emailsToDelete.includes(activeEmail.id)) {
        setActiveEmail(null);
      }
      
    } catch (error) {
      console.error('Error deleting emails:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setEmailsToDelete([]);
    }
  };

  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewEmail = (email) => {
    if (!email.read) {
      markAsRead([email.id]);
    }
    setActiveEmail(email);
  };

  return (
    <div className="flex flex-col bg-[#28292B] rounded-lg shadow-sm h-[calc(100vh-130px)] max-h-[800px] min-h-[600px]">
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="md"
        popup
        position="center"
      >
        <Modal.Header theme={{ base: "flex justify-between items-center pb-2" }} />
        <Modal.Body>
          <div className="text-center">
            <HiExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-900 dark:text-gray-300">
              {emailsToDelete.length > 1 
                ? `Are you sure you want to delete ${emailsToDelete.length} messages?` 
                : 'Are you sure you want to delete this message?'}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete'}
              </Button>
              <Button
                color="gray"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <div className="border-b border-gray-700">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-10 py-2 text-sm rounded-lg bg-[#161616] border-0 focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
              />
              <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-500 h-5 w-5" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                >
                  <HiX className="h-4 w-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setActiveEmail(null)}
              className={`rounded-full p-2 ${!activeEmail ? 'bg-gray-700 text-gray-200' : 'text-gray-400 hover:bg-[#161616]'}`}
            >
              <HiRefresh className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-4 py-2 bg-[#161616]">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-blue-600 rounded border-gray-600 focus:ring-blue-600 bg-gray-700"
              />
              <span className="text-xs text-gray-400 ml-2">
                {selectedEmails.length > 0 ? `${selectedEmails.length} selected` : 'Select all'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedEmails.length > 0 && (
              <>
                <button 
                  onClick={() => markAsRead(selectedEmails)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-700"
                  title="Mark as read"
                >
                  <HiMailOpen className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => markAsUnread(selectedEmails)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-700"
                  title="Mark as unread"
                >
                  <HiMail className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => showDeleteConfirmation(selectedEmails)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-700"
                  title="Delete"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${activeEmail ? 'hidden md:block md:w-1/3' : 'w-full'} border-r border-gray-700 overflow-y-auto`}>
          {filteredEmails.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {filteredEmails.map(email => (
                <li 
                  key={email.id} 
                  onClick={() => handleViewEmail(email)}
                  className={`relative cursor-pointer ${
                    email.read ? 'bg-[#28292B]' : 'bg-gray-800/50'
                  } hover:bg-gray-800 transition-colors`}
                >
                  <div className="flex items-center px-4 py-3">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="mr-2">
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(email.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectEmail(email.id);
                          }}
                          className="h-4 w-4 text-blue-600 rounded border-gray-600 focus:ring-blue-500 bg-gray-700"
                        />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleImportance(email.id);
                        }}
                        className="mr-3 text-gray-500 hover:text-yellow-300"
                      >
                        {email.important ? 
                          <HiStar className="h-5 w-5 text-yellow-300" /> : 
                          <HiOutlineStar className="h-5 w-5" />
                        }
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between">
                          <span className="flex items-center text-sm font-medium text-gray-300">
                            {email.from}
                            {!email.read && (
                              <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>
                            )}
                          </span>
                          <span className="text-xs text-gray-400">
                            {email.timestamp}
                          </span>
                        </div>
                        <p className={`truncate text-sm ${email.read ? 'text-gray-400' : 'text-gray-100 font-medium'}`}>
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {email.message}
                        </p>
                        {!email.read && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <HiMailOpen className="h-12 w-12 text-gray-600" />
              <p className="mt-2 text-gray-400 text-sm">No emails found</p>
            </div>
          )}
          
        </div>

        {activeEmail ? (
          <div className="w-full md:w-2/3 overflow-y-auto p-5 bg-[#28292B]">
            <div className="mb-5 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-medium text-white mb-2">
                  {activeEmail.subject}
                </h2>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-300">From: {activeEmail.from}</span>
                  <span className="text-sm text-gray-400 ml-4">&lt;{activeEmail.email}&gt;</span>
                </div>

                <div className="mt-3 space-y-2">
                  {activeEmail.contactNumber && (
                    <div className="flex items-center text-sm">
                      <HiPhone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-300">{activeEmail.contactNumber}</span>
                    </div>
                  )}

                  {activeEmail.organisationName && (
                    <div className="flex items-center text-sm">
                      <HiOfficeBuilding className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-300">{activeEmail.organisationName}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-400 mt-4">
                  Received: {activeEmail.timestamp}
                </div>
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => toggleImportance(activeEmail.id)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-800"
                >
                  {activeEmail.important ? 
                    <HiStar className="h-5 w-5 text-yellow-300" /> : 
                    <HiOutlineStar className="h-5 w-5" />
                  }
                </button>
                <button 
                  onClick={() => showDeleteConfirmation([activeEmail.id])}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-800"
                >
                  <HiTrash className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onReply(activeEmail)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-800"
                >
                  <HiReply className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex items-center mb-3">
                <HiOutlineDocumentText className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-300">Message</h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-200 bg-[#161616] p-4 rounded-lg">
                <p className="whitespace-pre-line">{activeEmail.message}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => onReply(activeEmail)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-xs text-white hover:bg-blue-700"
              >
                <HiReply className="mr-2 h-4 w-4" />
                Reply
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex md:flex-col md:items-center md:justify-center md:w-2/3">
            <div className="text-center">
              <HiMailOpen className="mx-auto h-12 w-12 text-gray-600" />
              <h3 className="mt-2 text-sm font-medium text-gray-100">Select an email to read</h3>
              <p className="mt-1 text-sm text-gray-400">
                Click on an email from the list to view its contents
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination - Fixed at bottom of entire component */}
      {isServerSidePagination && totalEmails > 0 && (
        <div className="border-t border-gray-700 p-4 bg-[#28292B] mt-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalEmails)} of {totalEmails} emails
              </span>
              {setPageSize && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-400">Show:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                    className="px-2 py-1 rounded border border-gray-600 bg-[#1E1F21] text-gray-300 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-400">per page</span>
                </div>
              )}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  setCurrentPage(Math.max(1, currentPage - 1));
                }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-[#1E1F21] border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              
              {(() => {
                const getPageNumbers = () => {
                  const pages = [];
                  const totalPageCount = totalPages;
                  
                  if (totalPageCount <= 7) {
                    // Show all pages if total is 7 or less
                    for (let i = 1; i <= totalPageCount; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first page
                    pages.push(1);
                    
                    if (currentPage <= 4) {
                      // Show pages 2, 3, 4, 5, ..., last
                      for (let i = 2; i <= 5; i++) {
                        pages.push(i);
                      }
                      if (totalPageCount > 6) {
                        pages.push('...');
                      }
                    } else if (currentPage >= totalPageCount - 3) {
                      // Show 1, ..., last-4, last-3, last-2, last-1, last
                      if (totalPageCount > 6) {
                        pages.push('...');
                      }
                      for (let i = totalPageCount - 4; i <= totalPageCount - 1; i++) {
                        if (i > 1) pages.push(i);
                      }
                    } else {
                      // Show 1, ..., current-1, current, current+1, ..., last
                      if (currentPage > 3) {
                        pages.push('...');
                      }
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        if (i > 1 && i < totalPageCount) pages.push(i);
                      }
                      if (currentPage < totalPageCount - 2) {
                        pages.push('...');
                      }
                    }
                    
                    // Always show last page
                    if (totalPageCount > 1) {
                      pages.push(totalPageCount);
                    }
                  }
                  
                  return pages;
                };

                return getPageNumbers().map((pageNum, idx) => {
                  if (pageNum === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-3 py-1.5 text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        pageNum === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-[#1E1F21] border border-gray-600 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}
              
              <button
                onClick={() => {
                  setCurrentPage(Math.min(totalPages, currentPage + 1));
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-[#1E1F21] border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailInbox; 