import React, { useState, useEffect } from 'react';
import { 
  HiPaperAirplane, 
  HiX, 
  HiOutlineDocumentText,
  HiLink, 
  HiDocumentText,
  HiOutlinePhotograph,
  HiChevronDown,
  HiQuestionMarkCircle,
  HiOutlineTrash,
  HiOutlineSave,
  HiOutlineEye,
  HiOutlineDotsHorizontal
} from 'react-icons/hi';
import { BiBold } from 'react-icons/bi';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const EmailCompose = ({ replyTo, onCancel }) => {
  // Form state
  const [to, setTo] = useState(replyTo ? replyTo.email : '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [message, setMessage] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isDraft, setIsDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const { getToken } = useAuth();

  // Set up default reply text if replying to an email
  useEffect(() => {
    if (replyTo) {
      setTo(replyTo.email || '');
      setSubject(`Re: ${replyTo.subject || ''}`);
      setMessage(`\n\n-------- Original Message --------\nFrom: ${replyTo.from}\nSubject: ${replyTo.subject}\n\n${replyTo.message}`);
    }
  }, [replyTo]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!to || !subject || !message) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setSending(true);
      const token = await getToken();
      
      // Prepare email data object
      const emailData = {
        to,
        subject,
        body: message,
        cc: cc || undefined,
        bcc: bcc || undefined
      };
      
      // If we have attachments, we would need to add them here
      // This would require additional implementation for file uploads
      
      // Send email using the new endpoint
      await axios.post('/admin/sendMail', emailData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Email sent successfully!');
      
      // Reset form
      setTo('');
      setSubject('');
      setMessage('');
      setCc('');
      setBcc('');
      setAttachments([]);
      
      // Close compose window
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.message || 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Save as draft
  const saveAsDraft = () => {
    setIsDraft(true);
    // Here you would save the draft via your API
    console.log('Saving draft:', { to, subject, message, cc, bcc, attachments });
    toast.success('Draft saved');
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };

  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };

  // Format text (simple version)
  const formatText = (format) => {
    switch(format) {
      case 'bold':
        setMessage(message + '<b></b>');
        break;
      case 'italic':
        setMessage(message + '<i></i>');
        break;
      case 'link':
        setMessage(message + '<a href=""></a>');
        break;
      default:
        break;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-[#28292B] rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white">{replyTo ? 'Reply to Email' : 'Compose New Email'}</h2>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-300 p-1"
          aria-label="Close"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          {/* Recipients */}
          <div>
            <div className="flex items-center">
              <label htmlFor="to" className="block w-12 text-sm font-medium text-gray-300">To:</label>
              <input
                type="email"
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="block w-full rounded-md bg-[#161616] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="recipient@example.com"
                required
              />
            </div>
          </div>
          
          {/* Cc/Bcc toggle */}
          {!showCcBcc && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowCcBcc(true)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Add Cc/Bcc
              </button>
            </div>
          )}
          
          {/* Cc and Bcc fields */}
          {showCcBcc && (
            <>
              <div className="flex items-center">
                <label htmlFor="cc" className="block w-12 text-sm font-medium text-gray-300">Cc:</label>
                <input
                  type="email"
                  id="cc"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="block w-full rounded-md bg-[#161616] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="cc@example.com"
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="bcc" className="block w-12 text-sm font-medium text-gray-300">Bcc:</label>
                <input
                  type="email"
                  id="bcc"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="block w-full rounded-md bg-[#161616] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="bcc@example.com"
                />
              </div>
            </>
          )}
          
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block w-full text-sm font-medium text-gray-300 mb-1">Subject:</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block w-full rounded-md bg-[#161616] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="Email subject"
              required
            />
          </div>
          
          {/* Formatting Toolbar */}
          <div className="flex items-center space-x-2 p-2 bg-[#161616] rounded-t-md border-b border-gray-700">
            <button 
              type="button" 
              onClick={() => formatText('bold')}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Bold"
            >
              <BiBold className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={() => formatText('italic')}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Italic"
            >
              <span className="italic font-serif">I</span>
            </button>
            <button 
              type="button" 
              onClick={() => formatText('link')}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Insert Link"
            >
              <HiLink className="w-4 h-4" />
            </button>
            <div className="border-l border-gray-700 h-5 mx-2"></div>
            <label className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded cursor-pointer" title="Attach File">
              <HiOutlinePhotograph className="w-4 h-4" />
              <input type="file" className="hidden" onChange={handleFileUpload} multiple />
            </label>
          </div>
          
          {/* Message */}
          <div>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="block w-full rounded-b-md bg-[#161616] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 text-sm resize-none"
              placeholder="Write your message here..."
              required
            ></textarea>
          </div>
          
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Attachments</h4>
              <div className="space-y-2">
                {attachments.map(attachment => (
                  <div 
                    key={attachment.id} 
                    className="flex items-center justify-between p-2 bg-[#161616] rounded border border-gray-700 text-sm"
                  >
                    <div className="flex items-center">
                      <HiDocumentText className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-gray-200 font-medium truncate max-w-xs">{attachment.name}</p>
                        <p className="text-gray-400 text-xs">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                      aria-label="Remove attachment"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="mt-6 flex justify-between items-center">
          <div>
            <label className="inline-flex items-center text-gray-400 hover:text-white hover:bg-gray-700 rounded p-2 cursor-pointer">
              <HiOutlinePhotograph className="w-5 h-5 mr-2" />
              <span className="text-sm">Attach Files</span>
              <input type="file" className="hidden" onChange={handleFileUpload} multiple />
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={saveAsDraft}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-[#161616] text-gray-300 border border-gray-700 hover:bg-gray-800"
            >
              <HiOutlineSave className="w-4 h-4 mr-1" />
              Save Draft
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-70"
            >
              {sending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <HiPaperAirplane className="w-4 h-4 mr-2 transform rotate-90" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmailCompose; 