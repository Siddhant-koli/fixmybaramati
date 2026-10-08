'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const translations = {
  en: {
    'language.label': 'Language',
    'language.english': 'English',
    'language.marathi': 'मराठी',
    'nav.home': 'Home',
    'nav.reportIssue': 'Report an Issue',
    'nav.myReports': 'My Reports',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.menu': 'Toggle menu',
    'nav.logoutError': 'Unable to log out right now. Please try again.',
    'home.title': 'Make Baramati Better',
    'home.intro': 'Report civic problems like potholes, garbage, street lights, and water issues. Together, we can create a better city for everyone.',
    'home.reportIssue': 'Report an Issue',
    'home.viewReports': 'View Reports',
    'home.howItWorks': 'How It Works',
    'home.stepReport': 'Report',
    'home.stepReportDescription': 'Capture a photo, add location, and describe the civic issue',
    'home.stepTrack': 'Track',
    'home.stepTrackDescription': 'Monitor the status of your report in real time',
    'home.stepResolve': 'Resolve',
    'home.stepResolveDescription': 'The civic team works to resolve the issue',
    'home.categories': 'Issues You Can Report',
    'home.ready': 'Ready to Make a Difference?',
    'home.readyDescription': 'Your voice matters. Report issues and help build a cleaner, safer Baramati for all citizens.',
    'home.startReporting': 'Start Reporting Now',
    'home.about': 'A civic issue reporting platform helping citizens make Baramati better.',
    'home.quickLinks': 'Quick Links',
    'home.browseReports': 'Browse Reports',
    'home.support': 'Support',
    'home.helpCenter': 'Help Center',
    'home.contactUs': 'Contact Us',
    'home.faq': 'FAQ',
    'home.contact': 'Contact',
    'home.email': 'Email',
    'home.phone': 'Phone',
    'home.copyright': 'All rights reserved.',
    'home.privacy': 'Privacy Policy',
    'home.terms': 'Terms of Service',
    'category.potholes': 'Potholes',
    'category.garbage': 'Garbage',
    'category.streetLights': 'Street Lights',
    'category.water': 'Water',
    'category.drainage': 'Drainage',
    'category.roads': 'Roads',
    'category.other': 'Other',
    'auth.welcomeBack': 'Welcome Back',
    'auth.loginDescription': 'Log in to track and manage your civic reports',
    'auth.mobile': 'Mobile Number',
    'auth.mobilePlaceholder': '10-digit Indian mobile number',
    'auth.mobileHint': 'Enter a valid 10-digit Indian mobile number',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'At least 6 characters',
    'auth.confirmPassword': 'Confirm Password',
    'auth.confirmPasswordPlaceholder': 'Re-enter your password',
    'auth.showPassword': 'Show password',
    'auth.hidePassword': 'Hide password',
    'auth.loggingIn': 'Logging in...',
    'auth.login': 'Login',
    'auth.enterCredentials': 'Enter your mobile number and password.',
    'auth.loginError': 'Unable to log in right now. Please try again later.',
    'auth.noAccount': "Don't have an account?",
    'auth.registerHere': 'Register here',
    'auth.backHome': 'Back to Home',
    'auth.createAccount': 'Create Your Account',
    'auth.registerDescription': 'Join FixMyBaramati and start reporting civic issues',
    'auth.fullName': 'Full Name',
    'auth.fullNamePlaceholder': 'Enter your full name',
    'auth.creatingAccount': 'Creating account...',
    'auth.createAccountButton': 'Create Account',
    'auth.hasAccount': 'Already have an account?',
    'auth.loginHere': 'Log in here',
    'auth.mobileRequired': 'Mobile number is required',
    'auth.mobileLength': 'Mobile number must be exactly 10 digits',
    'auth.mobilePrefix': 'Mobile number must start with 6-9',
    'auth.passwordRequired': 'Password is required',
    'auth.passwordLength': 'Password must be at least 6 characters',
    'auth.invalidCredentials': 'Invalid mobile number or password.',
    'auth.loginConnectionError': 'Unable to connect to the server right now. Please try again later.',
    'auth.fullNameRequired': 'Full name is required',
    'auth.fullNameLength': 'Full name must be at least 2 characters',
    'auth.confirmRequired': 'Please confirm your password',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.registrationFailed': 'Registration failed. Please try again.',
    'auth.registrationValidationError': 'Please correct the highlighted details and try again.',
    'auth.registrationSuccess': 'Registration successful.',
    'auth.duplicateMobile': 'An account with this mobile number already exists.',
    'auth.genericRegistrationError': 'Registration failed. Please try again later.',
    'common.backHome': 'Back to Home',
    'common.locationUnknown': 'Location not specified',
    'common.notAvailable': 'Not available',
    'common.status': 'Status',
    'common.category': 'Category',
    'common.description': 'Description',
    'common.dateReported': 'Date reported',
    'common.currentStatus': 'Current status',
    'common.reportId': 'Report ID',
    'common.submitted': 'Submitted',
    'common.upvotes': 'Upvotes',
    'common.viewReport': 'View Report',
    'common.loading': 'Loading...',
    'common.tryAgain': 'Please try again later.',
    'status.pending': 'Pending',
    'status.inProgress': 'In Progress',
    'status.resolved': 'Resolved',
    'status.rejected': 'Rejected',
    'dashboard.title': 'Citizen Dashboard',
    'dashboard.description': 'Track your civic reports and help make Baramati better.',
    'dashboard.welcome': 'Welcome, {name}! Here is an overview of your civic contributions.',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.newReport': 'Report an Issue',
    'dashboard.newReportDescription': 'Submit a new civic issue in your area',
    'dashboard.myReports': 'My Reports',
    'dashboard.myReportsDescription': 'View and track your submitted reports',
    'dashboard.browseReports': 'Browse Reports',
    'dashboard.browseReportsDescription': 'See all civic issues in Baramati',
    'dashboard.statistics': 'Your Statistics',
    'dashboard.reportsSubmitted': 'Reports Submitted',
    'dashboard.reportsResolved': 'Reports Resolved',
    'dashboard.inProgress': 'In Progress',
    'dashboard.communityUpvotes': 'Community Upvotes',
    'dashboard.recentReports': 'Recent Reports',
    'dashboard.noReports': 'No reports yet',
    'dashboard.noReportsDescription': 'Start by reporting a civic issue in your area to see your submissions here.',
    'dashboard.helpResources': 'Help & Resources',
    'dashboard.howToReport': 'How to Report',
    'dashboard.howToReportDescription': 'Learn how to submit a civic issue effectively',
    'dashboard.faqDescription': 'Find answers to common questions',
    'dashboard.contactSupport': 'Contact Support',
    'dashboard.contactSupportDescription': 'Get help from our support team',
    'dashboard.backHomeDescription': 'Return to the homepage',
    'dashboard.aboutTitle': 'About Your Dashboard',
    'dashboard.aboutDescription': 'This dashboard shows your submitted reports and community impact.',
    'dashboard.sessionError': 'Unable to verify your session right now. Please try again later.',
    'dashboard.loadError': 'Unable to load your dashboard right now. Please try again later.',
    'report.title': 'Report a Civic Issue',
    'report.intro': 'Help improve Baramati by reporting problems in your area.',
    'report.submitted': 'Report Submitted',
    'report.savedPending': 'Your civic issue has been saved and is now pending review.',
    'report.submitAnother': 'Submit Another Report',
    'report.issueInformation': 'Issue Information',
    'report.issueTitle': 'Issue Title',
    'report.titlePlaceholder': 'e.g. Large pothole near main road',
    'report.selectCategory': '-- Select a category --',
    'report.descriptionPlaceholder': 'Describe the issue in detail. What is the problem and where is it located?',
    'report.minimumCharacters': 'Minimum 20 characters',
    'report.photoOptional': 'Photo (Optional)',
    'report.uploadPhoto': 'Upload a Photo',
    'report.photoTypes': 'Accepted formats: JPEG, PNG, WEBP. Maximum size: 5 MB.',
    'report.selectedPhoto': 'Selected: {name}',
    'report.photoPreview': 'Selected civic issue photo preview',
    'report.locationDetails': 'Location Details',
    'report.coordinates': 'Coordinates',
    'report.useMyLocation': 'Use My Location',
    'report.gettingLocation': 'Getting location...',
    'report.geolocationUnsupported': 'Geolocation is not supported by your browser',
    'report.locationSuccess': 'Location obtained successfully. You can adjust it if needed.',
    'report.locationDenied': 'Location permission denied. Please enable it in your browser settings.',
    'report.locationFailed': 'Unable to get location. Please try again.',
    'report.latitude': 'Latitude',
    'report.longitude': 'Longitude',
    'report.submitting': 'Submitting report...',
    'report.submit': 'Submit Report',
    'report.titleRequired': 'Issue title is required',
    'report.titleLength': 'Title must be at least 5 characters',
    'report.categoryRequired': 'Please select a category',
    'report.descriptionRequired': 'Description is required',
    'report.descriptionLength': 'Description must be at least 20 characters',
    'report.coordinatesBoth': 'Enter both latitude and longitude, or leave both empty',
    'report.coordinatesInvalid': 'Please enter valid numbers for coordinates',
    'report.latitudeRange': 'Latitude must be between -90 and 90',
    'report.longitudeRange': 'Longitude must be between -180 and 180',
    'report.photoInvalid': 'Please select a JPEG, PNG, or WEBP image.',
    'report.photoTypeRequired': 'Please select a valid image type: JPEG, PNG, or WEBP.',
    'report.photoTooLarge': 'Image must be smaller than 5 MB.',
    'report.photoEmpty': 'The selected image is empty.',
    'report.photoMissing': 'Please choose an image to upload.',
    'report.photoSignatureInvalid': 'The selected file does not look like a valid JPEG, PNG, or WEBP image.',
    'report.photoExtensionInvalid': 'Please select a file with a .jpg, .jpeg, .png, or .webp extension.',
    'report.submitError': 'Unable to submit the report right now. Please try again later.',
    'report.saveError': 'Unable to create the report. Please try again.',
    'report.validationError': 'Please correct the form details and try again.',
    'report.unauthenticated': 'Please log in to submit a report.',
    'report.signInRequired': 'Please sign in to submit a report.',
    'report.submittedSuccess': 'Your civic issue has been reported successfully.',
    'report.submittedPending': 'Your report has been submitted and is pending review.',
    'report.photoNotConfigured': 'Photo storage is not configured for this environment.',
    'report.photoUploadError': 'Unable to upload the photo. Please try again.',
    'reports.title': 'Civic Reports',
    'reports.description': 'Browse and track civic issues reported and addressed in Baramati.',
    'reports.filterStatus': 'Filter by Status',
    'reports.all': 'All',
    'reports.showing': 'Showing {shown} of {total} reports',
    'reports.loading': 'Loading reports...',
    'reports.loadErrorTitle': 'Unable to load reports',
    'reports.loadError': 'Unable to load reports right now. Please try again later.',
    'reports.noReports': 'No reports found',
    'reports.noMatches': 'No reports match the selected filter. Choose another status or view all reports.',
    'reports.viewDetails': 'View Details',
    'reports.photoAlt': 'Photo for civic report: {title}',
    'reports.loadListError': 'Unable to load the reports list.',
    'myReports.title': 'My Reports',
    'myReports.submittedBy': 'Reports submitted by {name}.',
    'myReports.loadError': 'Unable to load your reports right now. Please try again later.',
    'myReports.noReports': 'No reports yet',
    'myReports.emptyDescription': 'Your submitted civic issues will appear here.',
    'myReports.viewReport': 'View Report',
    'myReports.upvotesCount': '{count} upvotes',
    'detail.loading': 'Loading report details...',
    'detail.notFound': 'Report not found',
    'detail.notFoundDescription': 'The report you are looking for does not exist.',
    'detail.notFoundHelp': 'The requested report does not exist. Please check the link and try again.',
    'detail.backReports': 'Back to Reports',
    'detail.similarReport': 'Report a Similar Issue',
    'detail.backDashboard': 'Back to Dashboard',
    'detail.title': 'Report Details',
    'detail.locationInformation': 'Location Information',
    'detail.address': 'Address',
    'detail.mapPreview': 'Map Preview',
    'detail.coordinatesShown': 'The coordinates provided with this report are shown above.',
    'detail.reportPhoto': 'Report Photo',
    'detail.imageUnavailable': 'Image unavailable',
    'detail.noPhoto': 'No photo uploaded',
    'detail.imageLoadFailed': 'This uploaded image could not be loaded.',
    'detail.noPhotoIncluded': 'No photo was included with this report.',
    'detail.resolutionProgress': 'Resolution Progress',
    'detail.reported': 'Reported',
    'detail.underReview': 'Under Review',
    'detail.communitySupport': 'Community Support',
    'detail.citizensSupport': 'Community members supporting this report',
    'detail.alreadyUpvoted': '✓ Already Upvoted',
    'detail.upvote': '👍 Upvote This Report',
    'detail.summary': 'Report Summary',
    'detail.loadError': 'Unable to load this report. Please try again later.',
    'detail.photoAlt': 'Photo for report: {title}',
  },
  mr: {
    'language.label': 'भाषा',
    'language.english': 'English',
    'language.marathi': 'मराठी',
    'nav.home': 'मुख्यपृष्ठ',
    'nav.reportIssue': 'तक्रार नोंदवा',
    'nav.myReports': 'माझे अहवाल',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.login': 'लॉगिन',
    'nav.register': 'नोंदणी',
    'nav.logout': 'लॉगआउट',
    'nav.menu': 'मेनू उघडा',
    'nav.logoutError': 'सध्या लॉगआउट करता येत नाही. कृपया पुन्हा प्रयत्न करा.',
    'home.title': 'बारामती अधिक चांगली बनवूया',
    'home.intro': 'खड्डे, कचरा, पथदिवे आणि पाणीपुरवठ्याच्या समस्या नोंदवा. एकत्र येऊन सर्वांसाठी उत्तम शहर घडवूया.',
    'home.reportIssue': 'तक्रार नोंदवा',
    'home.viewReports': 'अहवाल पहा',
    'home.howItWorks': 'हे कसे कार्य करते',
    'home.stepReport': 'नोंदवा',
    'home.stepReportDescription': 'फोटो घ्या, स्थान जोडा आणि नागरी समस्येचे वर्णन करा',
    'home.stepTrack': 'मागोवा घ्या',
    'home.stepTrackDescription': 'तुमच्या अहवालाच्या स्थितीचा मागोवा घ्या',
    'home.stepResolve': 'निराकरण',
    'home.stepResolveDescription': 'नागरी पथक समस्येचे निराकरण करण्यासाठी काम करते',
    'home.categories': 'तुम्ही नोंदवू शकता अशा समस्या',
    'home.ready': 'बदल घडवण्यासाठी तयार आहात?',
    'home.readyDescription': 'तुमचा आवाज महत्त्वाचा आहे. समस्या नोंदवून बारामती अधिक स्वच्छ आणि सुरक्षित बनवण्यास मदत करा.',
    'home.startReporting': 'आता तक्रार नोंदवा',
    'home.about': 'नागरिकांना बारामती अधिक चांगली बनवण्यासाठी मदत करणारे नागरी समस्या नोंदणी व्यासपीठ.',
    'home.quickLinks': 'महत्त्वाचे दुवे',
    'home.browseReports': 'अहवाल पहा',
    'home.support': 'मदत',
    'home.helpCenter': 'मदत केंद्र',
    'home.contactUs': 'आमच्याशी संपर्क साधा',
    'home.faq': 'सामान्य प्रश्न',
    'home.contact': 'संपर्क',
    'home.email': 'ईमेल',
    'home.phone': 'फोन',
    'home.copyright': 'सर्व हक्क राखीव.',
    'home.privacy': 'गोपनीयता धोरण',
    'home.terms': 'सेवा अटी',
    'category.potholes': 'रस्त्यांवरील खड्डे',
    'category.garbage': 'कचरा',
    'category.streetLights': 'पथदिवे',
    'category.water': 'पाणी',
    'category.drainage': 'जलनिस्सारण',
    'category.roads': 'रस्ते',
    'category.other': 'इतर',
    'auth.welcomeBack': 'पुन्हा स्वागत आहे',
    'auth.loginDescription': 'तुमच्या नागरी अहवालांचा मागोवा घेण्यासाठी लॉगिन करा',
    'auth.mobile': 'मोबाईल क्रमांक',
    'auth.mobilePlaceholder': '१० अंकी भारतीय मोबाईल क्रमांक',
    'auth.mobileHint': 'वैध १० अंकी भारतीय मोबाईल क्रमांक प्रविष्ट करा',
    'auth.password': 'पासवर्ड',
    'auth.passwordPlaceholder': 'किमान ६ अक्षरे',
    'auth.confirmPassword': 'पासवर्डची पुष्टी करा',
    'auth.confirmPasswordPlaceholder': 'पासवर्ड पुन्हा प्रविष्ट करा',
    'auth.showPassword': 'पासवर्ड दाखवा',
    'auth.hidePassword': 'पासवर्ड लपवा',
    'auth.loggingIn': 'लॉगिन होत आहे...',
    'auth.login': 'लॉगिन',
    'auth.enterCredentials': 'तुमचा मोबाईल क्रमांक आणि पासवर्ड प्रविष्ट करा.',
    'auth.loginError': 'सध्या लॉगिन करता येत नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    'auth.noAccount': 'खाते नाही?',
    'auth.registerHere': 'येथे नोंदणी करा',
    'auth.backHome': 'मुख्यपृष्ठावर परत जा',
    'auth.createAccount': 'तुमचे खाते तयार करा',
    'auth.registerDescription': 'FixMyBaramati मध्ये सहभागी व्हा आणि नागरी समस्या नोंदवा',
    'auth.fullName': 'पूर्ण नाव',
    'auth.fullNamePlaceholder': 'तुमचे पूर्ण नाव प्रविष्ट करा',
    'auth.creatingAccount': 'खाते तयार होत आहे...',
    'auth.createAccountButton': 'खाते तयार करा',
    'auth.hasAccount': 'आधीपासून खाते आहे?',
    'auth.loginHere': 'येथे लॉगिन करा',
    'auth.mobileRequired': 'मोबाईल क्रमांक आवश्यक आहे',
    'auth.mobileLength': 'मोबाईल क्रमांक नेमका १० अंकी असावा',
    'auth.mobilePrefix': 'मोबाईल क्रमांकाची सुरुवात ६ ते ९ या अंकाने असावी',
    'auth.passwordRequired': 'पासवर्ड आवश्यक आहे',
    'auth.passwordLength': 'पासवर्ड किमान ६ अक्षरांचा असावा',
    'auth.invalidCredentials': 'मोबाईल क्रमांक किंवा पासवर्ड चुकीचा आहे.',
    'auth.loginConnectionError': 'सध्या सर्व्हरशी संपर्क साधता येत नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    'auth.fullNameRequired': 'पूर्ण नाव आवश्यक आहे',
    'auth.fullNameLength': 'पूर्ण नाव किमान २ अक्षरांचे असावे',
    'auth.confirmRequired': 'कृपया पासवर्डची पुष्टी करा',
    'auth.passwordMismatch': 'दोन्ही पासवर्ड जुळत नाहीत',
    'auth.registrationFailed': 'नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.',
    'auth.registrationValidationError': 'कृपया दाखवलेली माहिती दुरुस्त करून पुन्हा प्रयत्न करा.',
    'auth.registrationSuccess': 'नोंदणी यशस्वी झाली.',
    'auth.duplicateMobile': 'या मोबाईल क्रमांकासाठी खाते आधीपासून अस्तित्वात आहे.',
    'auth.genericRegistrationError': 'नोंदणी अयशस्वी झाली. कृपया नंतर पुन्हा प्रयत्न करा.',
    'common.backHome': 'मुख्यपृष्ठावर परत जा',
    'common.locationUnknown': 'स्थान दिलेले नाही',
    'common.notAvailable': 'उपलब्ध नाही',
    'common.status': 'स्थिती',
    'common.category': 'प्रकार',
    'common.description': 'वर्णन',
    'common.dateReported': 'नोंदविल्याची तारीख',
    'common.currentStatus': 'सध्याची स्थिती',
    'common.reportId': 'अहवाल क्रमांक',
    'common.submitted': 'सादर केले',
    'common.upvotes': 'समर्थने',
    'common.viewReport': 'अहवाल पहा',
    'common.loading': 'लोड होत आहे...',
    'common.tryAgain': 'कृपया नंतर पुन्हा प्रयत्न करा.',
    'status.pending': 'प्रलंबित',
    'status.inProgress': 'कार्यवाही सुरू',
    'status.resolved': 'निराकरण झाले',
    'status.rejected': 'नाकारले',
    'dashboard.title': 'नागरिक डॅशबोर्ड',
    'dashboard.description': 'तुमच्या नागरी अहवालांचा मागोवा घ्या आणि बारामती अधिक चांगली बनवा.',
    'dashboard.welcome': 'स्वागत आहे, {name}! तुमच्या नागरी योगदानाचा हा आढावा.',
    'dashboard.quickActions': 'झटपट कृती',
    'dashboard.newReport': 'तक्रार नोंदवा',
    'dashboard.newReportDescription': 'तुमच्या परिसरातील नवीन नागरी समस्या सादर करा',
    'dashboard.myReports': 'माझे अहवाल',
    'dashboard.myReportsDescription': 'तुम्ही सादर केलेले अहवाल पहा आणि त्यांचा मागोवा घ्या',
    'dashboard.browseReports': 'अहवाल पहा',
    'dashboard.browseReportsDescription': 'बारामतीतील सर्व नागरी समस्या पहा',
    'dashboard.statistics': 'तुमची आकडेवारी',
    'dashboard.reportsSubmitted': 'सादर केलेले अहवाल',
    'dashboard.reportsResolved': 'निराकरण झालेले अहवाल',
    'dashboard.inProgress': 'कार्यवाही सुरू',
    'dashboard.communityUpvotes': 'समुदायाचे समर्थन',
    'dashboard.recentReports': 'अलीकडील अहवाल',
    'dashboard.noReports': 'अद्याप कोणतेही अहवाल नाहीत',
    'dashboard.noReportsDescription': 'तुमचे अहवाल येथे पाहण्यासाठी परिसरातील समस्या नोंदवा.',
    'dashboard.helpResources': 'मदत आणि माहिती',
    'dashboard.howToReport': 'तक्रार कशी नोंदवावी',
    'dashboard.howToReportDescription': 'नागरी समस्या प्रभावीपणे कशी सादर करावी ते जाणून घ्या',
    'dashboard.faqDescription': 'सामान्य प्रश्नांची उत्तरे मिळवा',
    'dashboard.contactSupport': 'मदत पथकाशी संपर्क',
    'dashboard.contactSupportDescription': 'आमच्या मदत पथकाकडून सहाय्य मिळवा',
    'dashboard.backHomeDescription': 'मुख्यपृष्ठावर परत जा',
    'dashboard.aboutTitle': 'तुमच्या डॅशबोर्डबद्दल',
    'dashboard.aboutDescription': 'या डॅशबोर्डवर तुमचे अहवाल आणि समुदायासाठी केलेले योगदान दिसते.',
    'dashboard.sessionError': 'सध्या तुमचे सत्र तपासता येत नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    'dashboard.loadError': 'सध्या डॅशबोर्ड लोड करता येत नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    'report.title': 'नागरी समस्या नोंदवा',
    'report.intro': 'तुमच्या परिसरातील समस्या नोंदवून बारामती सुधारण्यास मदत करा.',
    'report.submitted': 'अहवाल सादर झाला',
    'report.savedPending': 'तुमची समस्या जतन झाली आहे आणि ती तपासणीसाठी प्रलंबित आहे.',
    'report.submitAnother': 'आणखी एक अहवाल सादर करा',
    'report.issueInformation': 'समस्येची माहिती',
    'report.issueTitle': 'समस्येचे शीर्षक',
    'report.titlePlaceholder': 'उदा. मुख्य रस्त्याजवळ मोठा खड्डा',
    'report.selectCategory': '-- समस्येचा प्रकार निवडा --',
    'report.descriptionPlaceholder': 'समस्येचे तपशीलवार वर्णन करा. समस्या काय आहे आणि ती कुठे आहे?',
    'report.minimumCharacters': 'किमान २० अक्षरे',
    'report.photoOptional': 'फोटो (ऐच्छिक)',
    'report.uploadPhoto': 'फोटो अपलोड करा',
    'report.photoTypes': 'स्वीकारलेले प्रकार: JPEG, PNG, WEBP. कमाल आकार: ५ MB.',
    'report.selectedPhoto': 'निवडलेला फोटो: {name}',
    'report.photoPreview': 'निवडलेल्या नागरी समस्येच्या फोटोचे पूर्वदृश्य',
    'report.locationDetails': 'स्थानाची माहिती',
    'report.coordinates': 'निर्देशांक',
    'report.useMyLocation': 'माझे स्थान वापरा',
    'report.gettingLocation': 'स्थान मिळवत आहे...',
    'report.geolocationUnsupported': 'तुमच्या ब्राउझरमध्ये स्थान शोधण्याची सुविधा उपलब्ध नाही',
    'report.locationSuccess': 'स्थान मिळाले. आवश्यक असल्यास तुम्ही ते बदलू शकता.',
    'report.locationDenied': 'स्थानाची परवानगी नाकारली. कृपया ब्राउझरच्या सेटिंग्जमध्ये परवानगी द्या.',
    'report.locationFailed': 'स्थान मिळवता आले नाही. कृपया पुन्हा प्रयत्न करा.',
    'report.latitude': 'अक्षांश',
    'report.longitude': 'रेखांश',
    'report.submitting': 'अहवाल सादर होत आहे...',
    'report.submit': 'अहवाल सादर करा',
    'report.titleRequired': 'समस्येचे शीर्षक आवश्यक आहे',
    'report.titleLength': 'शीर्षक किमान ५ अक्षरांचे असावे',
    'report.categoryRequired': 'कृपया समस्येचा प्रकार निवडा',
    'report.descriptionRequired': 'वर्णन आवश्यक आहे',
    'report.descriptionLength': 'वर्णन किमान २० अक्षरांचे असावे',
    'report.coordinatesBoth': 'अक्षांश आणि रेखांश दोन्ही भरा किंवा दोन्ही रिकामे ठेवा',
    'report.coordinatesInvalid': 'कृपया निर्देशांकांसाठी वैध संख्या भरा',
    'report.latitudeRange': 'अक्षांश -९० ते ९० दरम्यान असावा',
    'report.longitudeRange': 'रेखांश -१८० ते १८० दरम्यान असावा',
    'report.photoInvalid': 'कृपया JPEG, PNG किंवा WEBP स्वरूपातील फोटो निवडा.',
    'report.photoTypeRequired': 'कृपया वैध प्रतिमा प्रकार निवडा: JPEG, PNG किंवा WEBP.',
    'report.photoTooLarge': 'फोटोचा आकार ५ MB पेक्षा कमी असावा.',
    'report.photoMissing': 'कृपया अपलोड करण्यासाठी फोटो निवडा.',
    'report.photoEmpty': 'निवडलेली प्रतिमा रिकामी आहे.',
    'report.photoSignatureInvalid': 'निवडलेली फाइल JPEG, PNG किंवा WEBP स्वरूपातील वैध प्रतिमा दिसत नाही.',
    'report.photoExtensionInvalid': '.jpg, .jpeg, .png किंवा .webp विस्तार असलेली फाइल निवडा.',
    'report.submitError': 'सध्या अहवाल सादर करता येत नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    'report.saveError': 'अहवाल तयार करता आला नाही. कृपया पुन्हा प्रयत्न करा.',
    'report.validationError': 'कृपया फॉर्ममधील माहिती दुरुस्त करून पुन्हा प्रयत्न करा.',
    'report.unauthenticated': 'अहवाल सादर करण्यासाठी कृपया लॉगिन करा.',
    'report.signInRequired': 'अहवाल सादर करण्यासाठी कृपया लॉगिन करा.',
    'report.submittedSuccess': 'तुमची नागरी समस्या यशस्वीपणे नोंदवली आहे.',
    'report.submittedPending': 'तुमचा अहवाल सादर झाला असून तपासणीसाठी प्रलंबित आहे.',
    'report.photoNotConfigured': 'या वातावरणात फोटो साठवण्याची सुविधा उपलब्ध नाही.',
    'report.photoUploadError': 'फोटो अपलोड करता आला नाही. कृपया पुन्हा प्रयत्न करा.',
    'reports.title': 'नागरी अहवाल',
    'reports.description': 'बारामतीतील नोंदवलेल्या आणि सोडवण्यात येत असलेल्या नागरी समस्या पहा.',
    'reports.filterStatus': 'स्थितीनुसार निवडा',
    'reports.all': 'सर्व',
    'reports.showing': '{total} पैकी {shown} अहवाल दाखवत आहोत',
    'reports.loading': 'अहवाल लोड होत आहेत...',
    'reports.loadErrorTitle': 'अहवाल लोड करता आले नाहीत',
    'reports.loadError': 'सध्या अहवाल लोड करता येत नाहीत. कृपया नंतर पुन्हा प्रयत्न करा.',
    'reports.noReports': 'अहवाल आढळले नाहीत',
    'reports.noMatches': 'निवडलेल्या स्थितीशी जुळणारे अहवाल नाहीत. दुसरी स्थिती निवडा किंवा सर्व अहवाल पहा.',
    'reports.viewDetails': 'तपशील पहा',
    'reports.photoAlt': 'नागरी अहवालाचा फोटो: {title}',
    'reports.loadListError': 'अहवालांची यादी लोड करता आली नाही.',
    'myReports.title': 'माझे अहवाल',
    'myReports.submittedBy': '{name} यांनी सादर केलेले अहवाल.',
    'myReports.loadError': 'सध्या तुमचे अहवाल लोड करता येत नाहीत. कृपया नंतर पुन्हा प्रयत्न करा.',
    'myReports.noReports': 'अद्याप कोणतेही अहवाल नाहीत',
    'myReports.emptyDescription': 'तुम्ही सादर केलेल्या नागरी समस्या येथे दिसतील.',
    'myReports.viewReport': 'अहवाल पहा',
    'myReports.upvotesCount': '{count} समर्थने',
    'detail.loading': 'अहवालाचा तपशील लोड होत आहे...',
    'detail.notFound': 'अहवाल सापडला नाही',
    'detail.notFoundDescription': 'तुम्ही शोधत असलेला अहवाल अस्तित्वात नाही.',
    'detail.notFoundHelp': 'हा अहवाल अस्तित्वात नाही. कृपया दुवा तपासून पुन्हा प्रयत्न करा.',
    'detail.backReports': 'अहवालांकडे परत जा',
    'detail.similarReport': 'अशीच समस्या नोंदवा',
    'detail.backDashboard': 'डॅशबोर्डवर परत जा',
    'detail.title': 'अहवालाचा तपशील',
    'detail.locationInformation': 'स्थानाची माहिती',
    'detail.address': 'पत्ता',
    'detail.mapPreview': 'नकाशाचे पूर्वदृश्य',
    'detail.coordinatesShown': 'या अहवालासोबत दिलेले निर्देशांक वर दाखवले आहेत.',
    'detail.reportPhoto': 'अहवालाचा फोटो',
    'detail.imageUnavailable': 'प्रतिमा उपलब्ध नाही',
    'detail.noPhoto': 'फोटो अपलोड केलेला नाही',
    'detail.imageLoadFailed': 'अपलोड केलेली प्रतिमा लोड करता आली नाही.',
    'detail.noPhotoIncluded': 'या अहवालासोबत फोटो जोडलेला नाही.',
    'detail.resolutionProgress': 'निराकरणाची प्रगती',
    'detail.reported': 'नोंदवले',
    'detail.underReview': 'तपासणी सुरू',
    'detail.communitySupport': 'समुदायाचे समर्थन',
    'detail.citizensSupport': 'या अहवालाला नागरिकांचे समर्थन',
    'detail.alreadyUpvoted': '✓ आधीच समर्थन दिले',
    'detail.upvote': '👍 या अहवालाला समर्थन द्या',
    'detail.summary': 'अहवालाचा सारांश',
    'detail.loadError': 'हा अहवाल लोड करता आला नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    'detail.photoAlt': 'अहवालाचा फोटो: {title}',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
type TranslationValues = Record<string, string | number>;
type TranslationContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
};

const LANGUAGE_STORAGE_KEY = 'fixmybaramati-language';
const TranslationContext = createContext<TranslationContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === 'en' || savedLanguage === 'mr') {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  const t = useCallback(
    (key: TranslationKey, values?: TranslationValues) => {
      const template: string = translations[language][key];
      if (!values) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
      );
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider.');
  }
  return context;
}

export function translateApiMessage(
  message: string | undefined,
  t: TranslationContextValue['t'],
  fallback: TranslationKey
) {
  if (message) {
    const match = (Object.entries(translations.en) as [TranslationKey, string][]).find(
      ([, englishMessage]) => englishMessage === message
    );
    if (match) return t(match[0]);
  }
  return t(fallback);
}

export function translateStatus(
  status: string,
  t: TranslationContextValue['t']
) {
  const key = getStatusTranslationKey(status);
  return key ? t(key) : status;
}

export function getStatusTranslationKey(status: string): TranslationKey | undefined {
  const keys: Partial<Record<string, TranslationKey>> = {
    PENDING: 'status.pending',
    IN_PROGRESS: 'status.inProgress',
    RESOLVED: 'status.resolved',
    REJECTED: 'status.rejected',
  };
  return keys[status];
}

export function translateCategory(
  category: string,
  t: TranslationContextValue['t']
) {
  const key = getCategoryTranslationKey(category);
  return key ? t(key) : category;
}

export function getCategoryTranslationKey(category: string): TranslationKey | undefined {
  const keys: Record<string, TranslationKey> = {
    Potholes: 'category.potholes',
    Garbage: 'category.garbage',
    'Street Lights': 'category.streetLights',
    Water: 'category.water',
    Drainage: 'category.drainage',
    Roads: 'category.roads',
    Other: 'category.other',
  };
  return keys[category];
}

export function formatLocaleDate(date: string | Date, language: Language) {
  return new Intl.DateTimeFormat(language === 'mr' ? 'mr-IN' : 'en-IN').format(
    typeof date === 'string' ? new Date(date) : date
  );
}

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <span>{t('language.label')}</span>
      <select
        aria-label={t('language.label')}
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="en">{t('language.english')}</option>
        <option value="mr">{t('language.marathi')}</option>
      </select>
    </label>
  );
}

export function TranslatedText({
  k,
  values,
}: {
  k: TranslationKey;
  values?: TranslationValues;
}) {
  const { t } = useTranslation();
  return t(k, values);
}

export function LocalizedDate({ date }: { date: string | Date }) {
  const { language } = useTranslation();
  return formatLocaleDate(date, language);
}

export function TranslatedCategory({ category }: { category: string }) {
  const { t } = useTranslation();
  return translateCategory(category, t);
}

export function TranslatedStatus({ status }: { status: string }) {
  const { t } = useTranslation();
  return translateStatus(status, t);
}
