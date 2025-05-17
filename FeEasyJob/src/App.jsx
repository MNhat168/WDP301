import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./components/pages/jobseeker/login";
import HomePage from "./components/pages/jobseeker/Home/home";
import Index from "./components/pages";
import CVGenerator from "./components/pages/jobseeker/cvgenerator";
import CVProfile from "./components/pages/jobseeker/cvprofile";
import Profile from "./components/pages/jobseeker/profile";
import ChangePassword from "./components/pages/jobseeker/changepass";
import JobSearch from "./components/pages/jobseeker/jobsearch";
import PackageList from "./components/pages/jobseeker/packagelist";
import PackagePayment from "./components/pages/jobseeker/packagepayment";
import OTPVerification from "./components/layout/otpchecker";
import Register from "./components/pages/jobseeker/register";
import LoginEmp from "./components/pages/employer/loginemp";
import HomeEmp from "./components/pages/employer/homeemp";
import RegisterEmployer from "./components/pages/employer/registeremp";
import HomeAdmin from "./components/pages/admin/homead";
import PackageManagement from "./components/pages/admin/packagemanagement";
import UserManagement from "./components/pages/admin/usermanagement";
import PaymentCallback from "./components/pages/jobseeker/paymentcallback";
import About from "./components/layout/aboutus";
import CompanyDetail from "./components/pages/employer/companydetail";
import EditProfileCompany from "./components/pages/employer/editprofilecompany";
import ListJobCreate from "./components/pages/employer/listjobcreate";
import CreateJob from "./components/pages/employer/createjob";
import BlogDetail from "./components/pages/employer/blogdetailemp";
import BlogForm from "./components/pages/employer/blogform";
import BlogList from "./components/pages/employer/bloglistemp";
import JobDetailsEmployer from "./components/pages/employer/jobdetailsemployer";
import EditJob from "./components/pages/employer/editjob";
import CreateSkillTest from "./components/pages/employer/createskilltest";
import ListQuestion from "./components/pages/employer/listquestion";
import JobSeekerBlogList from "./components/pages/jobseeker/bloglistjobs";
import JobSeekerBlogDetail from "./components/pages/jobseeker/blogdetailjobs";
import AdminNotifications from "./components/pages/admin/adminnoti";
import UserDetail from "./components/pages/admin/userdetailad";
import ApproveCv from "./components/pages/employer/approveCv";
import Company from "./components/pages/jobseeker/company";
import Jobs from "./components/pages/jobseeker/jobs";
import JobDetail from "./components/pages/jobseeker/jobdetail";
import FavoriteJob from "./components/pages/jobseeker/favoriteJob";
import Application from "./components/pages/jobseeker/application";
import JobList from "./components/pages/admin/jobmanagement";
import DoTest from "./components/pages/employer/dotest";
import SkillTestMark from "./components/pages/employer/skilltestmark";


const App = () => {
  return (
    <Router>
      <div>
        <header>
          <nav className="navbar navbar-expand-lg">
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/homeemp" element={<HomeEmp />} />
          <Route path="/admin/home" element={<HomeAdmin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/loginemployeer" element={<LoginEmp />} />
          <Route path="/cvgenerate" element={<CVGenerator />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registeremp" element={<RegisterEmployer />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/cvprofile" element={<CVProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/changepass" element={<ChangePassword />} />
          <Route path="/jobsearch" element={<JobSearch />} />
          <Route path="/packages" element={<PackageList />} />
          <Route path="/upgrade-payment/:packageId" element={<PackagePayment />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/admin/packages" element={<PackageManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/create-or-update-company-profile" element={<CompanyDetail />} />
          <Route path="/edit-profile-company" element={<EditProfileCompany />} />
          <Route path="/jobslist" element={<ListJobCreate />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/jobdetails/:id" element={<JobDetailsEmployer />} />
          <Route path="/edit-job/:jobId" element={<EditJob />} />
          <Route path="/questions/loadskilltest/:jobId" element={<CreateSkillTest />} />
          <Route path="/questions/view/:jobId" element={<ListQuestion />} />
          <Route path="/employer/blogs" element={<BlogList />} />
          <Route path="/employer/blogs/:blogId" element={<BlogDetail />} />
          <Route path="/employer/create-blog" element={<BlogForm />} />
          <Route path="/employer/edit-blog/:blogId" element={<BlogForm />} />
          <Route path="/blogs" element={<JobSeekerBlogList />} />
          <Route path="/blogs/:blogId" element={<JobSeekerBlogDetail />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/users/:userId" component={UserDetail} />
          <Route path="/listApplyCv" element={<ApproveCv />} />
          <Route path="/companies" element={<Company />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs-detail" element={<JobDetail />} />
          <Route path="/favorite-jobs" element={<FavoriteJob />} />
          <Route path="/application" element={<Application />} />
          <Route path="/admin/jobs" element={<JobList />} />
          <Route path="/doskilltest" element={<DoTest />} />
          <Route path="/skill-test-result" element={<SkillTestMark />} />
        </Routes>
      </div>
    </Router>
  );
};


export default App;
