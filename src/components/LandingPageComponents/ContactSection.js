import React, { useState } from "react";
import { Alert } from "flowbite-react";
import { HiInformationCircle } from 'react-icons/hi';
import { submitContactForm } from "../../api/profileService";

export default function ContactSection({ content }) {
	const [formData, setFormData] = useState({
		fullname: "",
		email: "",
		message: ""
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [apiError, setApiError] = useState("");

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value
		});
	};

	// Validate name (only letters and spaces)
	const validateName = (name) => {
		return /^[A-Za-z\s]+$/.test(name);
	};

	// Validate email
	const validateEmail = (email) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const { fullname, email, message } = formData;
		const newErrors = {};

		// Validate inputs
		if (!fullname.trim()) {
			newErrors.fullname = "Name is required";
		} else if (!validateName(fullname)) {
			newErrors.fullname = "Name can only contain letters and spaces";
		}

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!validateEmail(email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!message.trim()) {
			newErrors.message = "Message is required";
		}

		// If there are errors, set them and return
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Clear errors
		setErrors({});
		setApiError("");
		setIsSubmitting(true);

		console.log("Submitting contact form:", { fullname, email, message });

		try {
			// Call the API
			const response = await submitContactForm(fullname, email, message);
			console.log("Contact form submission successful:", response);
			
			// Show success message
			setIsSuccess(true);
			
			// Clear form
			setFormData({
				fullname: "",
				email: "",
				message: ""
			});
		} catch (error) {
			console.error("Error submitting contact form:", error);
			// Handle API error
			if (error.response && error.response.data && error.response.data.message) {
				setApiError(error.response.data.message);
			} else {
				setApiError("Failed to submit your message. Please try again later.");
			}
			setIsSuccess(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section id="contact" className="bg-white px-6 py-16">
			<div className="container mx-auto max-w-7xl">
				{/* Header Section */}
				<div className="text-center mb-16">
					<div className="flex items-center justify-center gap-6 mb-4">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800">
							Contact Us
						</h1>
						<div className="hidden md:block w-16 h-0.5 bg-gray-400"></div>
						<div className="hidden md:block text-left">
							<p className="text-sm text-gray-600">Connect with us;</p>
							<p className="text-sm text-gray-600">Let's discuss what you need</p>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
					{/* Left Side - Contact Form */}
					<div className="order-2 lg:order-1">
						<div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#1D1D1D' }}>
							<h2 className="text-white text-lg font-normal mb-8">
								We are here for you! How can we help?
							</h2>
							
							{isSuccess && (
								<Alert color="success" icon={HiInformationCircle} className="mb-6">
									<span>Your message was sent successfully!</span>
								</Alert>
							)}
							
							{apiError && (
								<Alert color="failure" icon={HiInformationCircle} className="mb-6">
									<span>{apiError}</span>
								</Alert>
							)}
							
							<form onSubmit={handleSubmit} className="space-y-6">
								<div>
									<label htmlFor="fullname" className="block text-white text-sm font-normal mb-3">
										Name*
									</label>
									<input
										id="fullname"
										type="text"
										name="fullname"
										value={formData.fullname}
										onChange={handleInputChange}
										placeholder="Name"
										style={{ backgroundColor: '#FFFFFF !important', color: '#000000', border: errors.fullname ? '1px solid #ef4444' : '1px solid transparent' }}
										className={`w-full px-4 py-3 rounded-lg placeholder-gray-800 focus:outline-none focus:ring-0 focus:border-transparent transition-all duration-200`}
									/>
									{errors.fullname && (
										<p className="mt-2 text-xs text-red-400">{errors.fullname}</p>
									)}
								</div>
								
								<div>
									<label htmlFor="email" className="block text-white text-sm font-normal mb-3">
										Email*
									</label>
									<input
										id="email"
										type="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										placeholder="Email"
										style={{ backgroundColor: '#FFFFFF !important', color: '#000000', border: errors.email ? '1px solid #ef4444' : '1px solid transparent' }}
										className={`w-full px-4 py-3 rounded-lg placeholder-gray-800 focus:outline-none focus:ring-0 focus:border-transparent transition-all duration-200`}
									/>
									{errors.email && (
										<p className="mt-2 text-xs text-red-400">{errors.email}</p>
									)}
								</div>
								
								<div>
									<label htmlFor="message" className="block text-white text-sm font-normal mb-3">
										Message*
									</label>
									<textarea
										id="message"
										name="message"
										value={formData.message}
										onChange={handleInputChange}
										placeholder="Message"
										rows="4"
										style={{ backgroundColor: '#FFFFFF !important', color: '#000000', border: errors.message ? '1px solid #ef4444' : '1px solid transparent' }}
										className={`w-full px-4 py-3 rounded-lg placeholder-gray-800 focus:outline-none focus:ring-0 focus:border-transparent transition-all duration-200 resize-none`}
									/>
									{errors.message && (
										<p className="mt-2 text-xs text-red-400">{errors.message}</p>
									)}
								</div>
								
								<button
									type="submit"
									disabled={isSubmitting}
									className={`w-full py-3 px-6 text-black font-medium rounded-lg transition-colors duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
									style={{ backgroundColor: '#9ACD32' }}
								>
									{isSubmitting ? 'Sending...' : 'Send Message'}
								</button>
							</form>
						</div>
					</div>

					{/* Right Side - Illustration and Contact Info */}
					<div className="order-1 lg:order-2 flex flex-col items-center lg:items-start">
						{/* Illustration */}
						<div className="mb-12 flex justify-center lg:justify-start w-full">
							<img 
								src="/contact.svg" 
								alt="Contact illustration" 
								className="w-full max-w-md h-auto"
							/>
						</div>

						{/* Contact Information */}
						<div className="space-y-8 w-full max-w-md">
							{/* Address */}
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-6 h-6 mt-0.5">
									<svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
									</svg>
								</div>
								<div className="flex-1">
									<p className="text-gray-700 text-base leading-relaxed">
										1A,2,3,6,7A, 2nd Floor, Indira House,<br />
										Savitri Cinema Complex, Greater Kailash 2,<br />
										New Delhi - 110048
									</p>
								</div>
							</div>

							{/* Phone */}
							<div className="flex items-center gap-4">
								<div className="flex-shrink-0 w-6 h-6">
									<svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
									</svg>
								</div>
								<p className="text-gray-700 text-base">
									+91-7793820447
								</p>
							</div>

							{/* Email */}
							<div className="flex items-center gap-4">
								<div className="flex-shrink-0 w-6 h-6">
									<svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
										<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
									</svg>
								</div>
								<p className="text-gray-700 text-base">
									contact@foodoscope.com
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}