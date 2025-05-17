// <!DOCTYPE html>
// <html>
//     <head>
//         <meta charset="UTF-8">
//         <link rel="icon" href="assets/images/android-chrome-192x192.png">
//         <title>Easyjob | Create CV</title>
//         <script src="https://kit.fontawesome.com/3ef3559250.js" crossorigin="anonymous"></script>
//         <link rel="stylesheet" href="assets/css/cvgenerator.css">
//       <!--  <script src="assets/js/cvgenerator.js"></script>-->
//         <link rel="preconnect" href="https://fonts.googleapis.com">
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//         <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
//         <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.4.0/jspdf.debug.js" integrity="sha512-NMLPS0RLYPLrZ9S7kAjWu659RKcdwrssZSo7rzKsejLJspGmY/pLJg/dMereQnLQmBDg6vMZ1o45KcSO2yiroA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
//         <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.2.1/html2canvas.min.js" integrity="sha512-RGZt6PJZ2y5mdkLGwExIfOMlzRdkMREWobAwzTX4yQV0zdZfxBaYLJ6nPuMd7ZPXVzBQL6XAJx0iDXHyhuTheQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
//         <style>
//             #contentToDownload {
//                 background-color: #002b5b; /* Đặt màu nền của vùng tải PDF */
//                 color: #ffffff; /* Đặt màu chữ là trắng */
//             }
            
//             #contentToDownload i { 
//                 color: #ff9900; /* Đặt màu icon là cam */
//             }
//             .remove-item {
//                 background-color: transparent;
//                 border: none;
//                 font-size: 20px;
//                 cursor: pointer;
//                 margin-left: 10px;
//                 color: rgba(0, 0, 0, 0.5); /* Màu xám mờ cho dấu trừ */
//                 opacity: 0.7; /* Giảm độ đậm để làm mờ */
//             }
            
//             /* Style for the add item button */
//             .add-item {
//                 background-color: transparent;
//                 border: none;
//                 font-size: 24px;
//                 cursor: pointer;
//                 display: flex;
//                 justify-content: center;
//                 align-items: center;
//                 margin-top: 10px;
//                 color: rgba(0, 0, 0, 0.5); /* Màu xám mờ cho dấu cộng */
//                 opacity: 0.7; /* Giảm độ đậm để làm mờ */
//             }
            
//             .add-item:hover, .remove-item:hover {
//                 opacity: 1; /* Khi hover thì màu sẽ rõ hơn */
//             }
          
            
        
            
        
//          </style>   
//     </head>
//     <body>
//         <section class="resume" id="contentToDownload">
//             <div class="resume">
//                 <div class="base">
//                     <div class="profile">
//                         <div class="photo">
//                             <!--<img src="" /> -->
//                             <i class="fas fa-rocket"></i>
//                         </div>
//                         <div class="info">
//                             <h1 class="name" contenteditable="true">Naomi Weatherford</h1>
//                             <h2 class="job" contenteditable="true">Frontend Web Designer</h2>
//                         </div>
//                     </div>
//                     <div class="about" style="padding-bottom: 6rem;">
//                         <h3>About Me</h3>
//                         <p contenteditable="true">I'm a web designer for Fiserv, specializing in web design, graphic design, and UX. Experienced with the Adobe Creative Suite, responsive design, social media management, and prototyping.</p>
//                     </div>
//                     <div class="contact">
//                         <h3>Contact Me</h3>
//                         <div class="call">
//                             <div style="display: inline-flex; align-items: center;">
//                                 <i class="fas fa-phone" style="margin-right: 14px;"></i>
//                                 <span contenteditable="true" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; display: inline-block;">123-456-7890</span>
//                             </div>
//                         </div>
//                         <div class="address">
//                             <div style="display: inline-flex; align-items: center;">
//                                 <i class="fas fa-map-marker" style="margin-right: 14px;"></i>
//                                 <span contenteditable="true" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; display: inline-block;">Provo, Utah</span>
//                             </div>
//                         </div>
//                         <div class="email">
//                             <div style="display: inline-flex; align-items: center;">
//                                 <i class="fas fa-envelope" style="margin-right: 14px;"></i>
//                                 <span contenteditable="true" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; display: inline-block;">astronaomical@gmail.com</span>
//                             </div>
//                         </div>
                        
                        
                        
//                         <div class="website">
//                             <div style="display: inline-flex; align-items: center;">
//                                 <i class="fas fa-home" style="margin-right: 14px;"></i>
//                                 <span contenteditable="true" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; display: inline-block;">astronaomical.com</span>
//                             </div>
//                         </div>
                        
                        
                        
//                     </div>
                
//                 </div>
    
//                 <div class="func">
                    
//                     <div class="work">
//                         <div class="section-header">
//                             <h3><i class="fa fa-briefcase"></i> Experience</h3>
//                             <!-- Add button for adding work experience -->
//                             <button id="add-work-item" class="add-item">+</button>
//                         </div>
//                         <ul id="work-list">
//                             <li>
//                                 <span contenteditable="true">Technical Consultant </span>
//                                 <small contenteditable="true">Fiserv</small>
//                                 <small contenteditable="true">Apr 2018 - Now</small>
//                                 <button class="remove-item">−</button>
//                             </li>
//                             <li>
//                                 <span contenteditable="true">Web Designer</span>
//                                 <small contenteditable="true">Lynden</small>
//                                 <small contenteditable="true">Jan 2018 - Apr 2018</small>
//                                 <button class="remove-item">−</button>
//                             </li>
//                             <li>
//                                 <span contenteditable="true">Intern - Web Design</span>
//                                 <small contenteditable="true">Lynden</small>
//                                 <small contenteditable="true">Aug 2017 - Dec 2017</small>
//                                 <button class="remove-item">−</button>
//                             </li>
//                         </ul>
//                     </div>
                    
//                     <div class="edu" >
//                         <div class="section-header">
//                             <h3><i class="fa fa-graduation-cap"></i> Education</h3>
//                             <!-- Add button for adding education experience -->
//                             <button id="add-edu-item" class="add-item">+</button>
//                         </div>
//                         <ul id="edu-list">
//                             <li>
//                                 <span contenteditable="true"> Web Design </span>
//                                 <small contenteditable="true">BYU-Idaho</small>
//                                 <small contenteditable="true">Jan. 2016 - Apr. 2018</small>
//                                 <button class="remove-item">−</button>
//                             </li>
//                             <li>
//                                 <span contenteditable="true">Computer Science</span>
//                                 <small contenteditable="true">Edmonds Community College</small>
//                                 <small contenteditable="true">Sept. 2014 - Dec. 2015</small>
//                                 <button class="remove-item">−</button>
//                             </li>
//                             <li>
//                                 <span contenteditable="true">High School</span>
//                                 <small contenteditable="true">Henry M. Jackson High School</small>
//                                 <small contenteditable="true">Jan. 2013 - Jun. 2015</small>
//                                 <button class="remove-item">−</button>
//                             </li>
//                         </ul>
//                     </div>

                

                    
//                     <script>
//                         // Add and remove work experience
//                         document.getElementById('add-work-item').addEventListener('click', () => {
//                             const workList = document.getElementById('work-list');
//                             const newWorkItem = document.createElement('li');
//                             newWorkItem.innerHTML = `
//                                 <span contenteditable="true">New Job Title</span>
//                                 <small contenteditable="true">Company Name</small>
//                                 <small contenteditable="true">Start Date - End Date</small>
//                                 <button class="remove-item">−</button>
//                             `;
//                             workList.appendChild(newWorkItem);
//                             addRemoveFunctionality(newWorkItem);  // Ensure new items can be removed
//                         });
                    
//                         // Add and remove education experience
//                         document.getElementById('add-edu-item').addEventListener('click', () => {
//                             const eduList = document.getElementById('edu-list');
//                             const newEduItem = document.createElement('li');
//                             newEduItem.innerHTML = `
//                                 <span contenteditable="true">New Degree/Certificate</span>
//                                 <small contenteditable="true">Institution Name</small>
//                                 <small contenteditable="true">Start Date - End Date</small>
//                                 <button class="remove-item">−</button>
//                             `;
//                             eduList.appendChild(newEduItem);
//                             addRemoveFunctionality(newEduItem);  // Ensure new items can be removed
//                         });
                    
//                         // Function to enable removing list items
//                         const addRemoveFunctionality = (item) => {
//                             const removeButton = item.querySelector('.remove-item');
//                             removeButton.addEventListener('click', () => {
//                                 item.remove();
//                             });
//                         };
                    
//                         // Apply remove functionality to existing items
//                         document.querySelectorAll('.remove-item').forEach(button => {
//                             const listItem = button.parentElement;
//                             addRemoveFunctionality(listItem);
//                         });
                    
//                         let draggedItem = null;
                    
//                         // Function to make list items draggable
//                         const makeDraggable = (ul) => {
//                             ul.addEventListener('mousedown', (event) => {
//                                 if (event.target.tagName === 'LI') {
//                                     draggedItem = event.target;
//                                     draggedItem.style.opacity = '0.5';
//                                 }
//                             });
                    
//                             ul.addEventListener('mousemove', (event) => {
//                                 if (draggedItem) {
//                                     const items = Array.from(ul.children);
//                                     const hoverItem = items.find(item => {
//                                         return item !== draggedItem && item.getBoundingClientRect().top < event.clientY && item.getBoundingClientRect().bottom > event.clientY;
//                                     });
                    
//                                     if (hoverItem) {
//                                         const bounding = hoverItem.getBoundingClientRect();
//                                         const offset = bounding.y + bounding.height / 2;
                    
//                                         if (event.clientY > offset) {
//                                             hoverItem.after(draggedItem);
//                                         } else {
//                                             hoverItem.before(draggedItem);
//                                         }
//                                     }
//                                 }
//                             });
                    
//                             ul.addEventListener('mouseup', () => {
//                                 if (draggedItem) {
//                                     draggedItem.style.opacity = '1';
//                                     draggedItem = null;
//                                 }
//                             });
                    
//                             ul.addEventListener('mouseleave', () => {
//                                 if (draggedItem) {
//                                     draggedItem.style.opacity = '1';
//                                     draggedItem = null;
//                                 }
//                             });
//                         };
                    
//                         // Apply draggable functionality to work and education lists
//                         makeDraggable(document.getElementById('work-list'));
//                         makeDraggable(document.getElementById('edu-list'));
//                     </script>
                    
//                     <div class="skills-prog" >
//                         <h3><i class="fas fa-code"></i>Programming Skills</h3>
//                         <ul>
//                             <li data-percent="95"><span contenteditable="true">HTML5</span>
//                                 <div class="skills-bar">
//                                     <div class="bar"></div>
//                                 </div>
//                             </li>
//                             <li data-percent="90"><span contenteditable="true">CSS3 & SCSS</span>
//                                 <div class="skills-bar">
//                                     <div class="bar"></div>
//                                 </div>
//                             </li>
//                             <li data-percent="60"><span contenteditable="true">JavaScript</span>
//                                 <div class="skills-bar">
//                                     <div class="bar"></div>
//                                 </div>
//                             </li>
//                             <li data-percent="50"><span contenteditable="true">jQuery</span>
//                                 <div class="skills-bar">
//                                     <div class="bar"></div>
//                                 </div>
//                             </li>
//                             <li data-percent="40"><span contenteditable="true">JSON</span>
//                                 <div class="skills-bar">
//                                     <div class="bar"></div>
//                                 </div>
//                             </li>
//                             <li data-percent="55"><span contenteditable="true">PHP</span>
//                                 <div class="skills-bar">
//                                     <div class="bar"></div>
//                                 </div>
//                             </li>
//                             <li data-percent="40"><span contenteditable="true">MySQL</span>
//                                 <div class="skills-bar">
//                                     <div class="bar"></div>
//                                 </div>
//                             </li>
//                         </ul>
//                     </div>
    
//                     <div class="skills-soft">
//                         <h3><i class="fas fa-bezier-curve"></i>Software Skills</h3>
//                         <ul>
//                             <li data-percent="90">
//                                 <svg viewbox="0 0 100 100">
//                                     <circle cx="50" cy="50" r="45"></circle>
//                                     <circle class="cbar" cx="50" cy="50" r="45"></circle>
//                                 </svg><span contenteditable="true"></span><small contenteditable="true">Illustrator</small>
//                             </li>
//                             <li data-percent="75">
//                                 <svg viewbox="0 0 100 100">
//                                     <circle cx="50" cy="50" r="45"></circle>
//                                     <circle class="cbar" cx="50" cy="50" r="45"></circle>
//                                 </svg><span contenteditable="true"></span><small contenteditable="true">Photoshop</small>
//                             </li>
//                             <li data-percent="85">
//                                 <svg viewbox="0 0 100 100">
//                                     <circle cx="50" cy="50" r="45"></circle>
//                                     <circle class="cbar" cx="50" cy="50" r="45"></circle>
//                                 </svg><span contenteditable="true"></span><small contenteditable="true">InDesign</small>
//                             </li>
//                             <li data-percent="65">
//                                 <svg viewbox="0 0 100 100">
//                                     <circle cx="50" cy="50" r="45"></circle>
//                                     <circle class="cbar" cx="50" cy="50" r="45"></circle>
//                                 </svg><span contenteditable="true"></span><small contenteditable="true">Dreamweaver</small>
//                             </li>
//                         </ul>
//                     </div>
    
//                     <div class="interests">
//                         <h3><i class="fas fa-star"></i>Interests</h3>
//                         <div class="interests-items">
//                             <div class="art"><i class="fas fa-palette"></i><span contenteditable="true">Art</span></div>
//                             <div class="art"><i class="fas fa-book"></i><span contenteditable="true">Books</span></div>
//                             <div class="art"><i class="fas fa-paw"></i><span contenteditable="true">Animals</span></div>
//                             <div class="art"><i class="fas fa-gamepad"></i><span contenteditable="true">Gaming</span></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//         <button class="download-button" onclick="downloadPDF()">Download CV</button>  
//     </body>
    

//     <script>
//         function downloadPDF() {
//             // Lấy phần nội dung của section có id là contentToDownload
//             const contentToDownload = document.getElementById('contentToDownload');

//             // Sử dụng thư viện HTML2Canvas để chụp nội dung HTML và chuyển đổi thành hình ảnh
//             html2canvas(contentToDownload, {scale: 2}).then(function (canvas) {
//                 // Chuyển đổi hình ảnh thành dữ liệu URL
//                 const imgData = canvas.toDataURL('image/png');

//                 // Tạo một instance của jsPDF
//                 const pdf = new jsPDF('p', 'mm', 'a4');

//                 // Thêm hình ảnh đã chụp vào file PDF
//                 pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

//                 // Tải xuống file PDF
//                 pdf.save('downloaded_content.pdf');
//             });
//         }
//     </script>
    
    

//     <!-- Include the html2pdf library -->
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"></script>
// <script>
//     // Function to initialize draggable skills progress bars
//     function initSkills() {
//       const skillsProg = document.querySelectorAll('.skills-prog li');
//       const skillsSoft = document.querySelectorAll('.skills-soft ul li');
  
//       // Initialize for programming skills (linear bars)
//       skillsProg.forEach(skill => {
//         const bar = skill.querySelector('.bar');
//         const percent = skill.getAttribute('data-percent');
//         const span = document.createElement('span');
//         span.innerText = `${percent}%`;
//         span.style.cursor = 'pointer';
//         skill.appendChild(span);  // Show percentage
  
//         // Set initial width
//         updateLinearProgress(skill, percent);
  
//         // Add mouse event listeners for dragging
//         skill.addEventListener('mousedown', function(event) {
//           const startX = event.clientX;
//           const barWidth = skill.querySelector('.skills-bar').offsetWidth;
//           const initialPercent = parseInt(skill.getAttribute('data-percent'));
  
//           const handleMouseMove = (event) => {
//             const deltaX = event.clientX - startX;
//             let newPercent = Math.min(Math.max(initialPercent + (deltaX / barWidth) * 100, 0), 100);
//             newPercent = Math.round(newPercent);
//             skill.setAttribute('data-percent', newPercent);
//             span.innerText = `${newPercent}%`;
//             updateLinearProgress(skill, newPercent);
//           };
  
//           const handleMouseUp = () => {
//             document.removeEventListener('mousemove', handleMouseMove);
//             document.removeEventListener('mouseup', handleMouseUp);
//           };
  
//           document.addEventListener('mousemove', handleMouseMove);
//           document.addEventListener('mouseup', handleMouseUp);
//         });
//       });
  
//       // Initialize for software skills (circular bars)
//       skillsSoft.forEach(skill => {
//         const percent = skill.getAttribute('data-percent');
//         const span = document.createElement('span');
//         span.innerText = `${percent}%`;
//         span.style.cursor = 'pointer';
//         skill.appendChild(span);  // Show percentage
  
//         updateCircularProgress(skill, percent);
  
//         // Add event listeners for dragging
//         skill.addEventListener('mousedown', function(event) {
//           const circle = skill.querySelector('.cbar');
//           const rect = skill.getBoundingClientRect();
//           const radius = circle.r.baseVal.value;
//           const centerX = rect.left + radius;
//           const centerY = rect.top + radius;
  
//           const handleMouseMove = (event) => {
//             const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
//             let newPercent = Math.round(((angle + Math.PI) / (2 * Math.PI)) * 100);
//             newPercent = Math.max(0, Math.min(100, newPercent));
//             skill.setAttribute('data-percent', newPercent);
//             span.innerText = `${newPercent}%`;
//             updateCircularProgress(skill, newPercent);
//           };
  
//           const handleMouseUp = () => {
//             document.removeEventListener('mousemove', handleMouseMove);
//             document.removeEventListener('mouseup', handleMouseUp);
//           };
  
//           document.addEventListener('mousemove', handleMouseMove);
//           document.addEventListener('mouseup', handleMouseUp);
//         });
//       });
//     }
  
//     // Function to update the linear progress bars
//     function updateLinearProgress(skill, percent) {
//       const bar = skill.querySelector('.bar');
//       bar.style.width = `${percent}%`;
//     }
  
//     // Function to update the circular progress bars
//     function updateCircularProgress(skill, percent) {
//       const circle = skill.querySelector('.cbar');
//       const radius = circle.r.baseVal.value;
//       const circumference = 2 * Math.PI * radius;
//       const offset = circumference - (percent / 100) * circumference;
//       circle.style.strokeDasharray = `${circumference} ${circumference}`;
//       circle.style.strokeDashoffset = offset;
//     }
  
//     // Initialize the skills progress bars and make them draggable
//     document.addEventListener('DOMContentLoaded', initSkills);
//   </script>
  

// </html>

import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import useBanCheck from '../admin/checkban'; 

const CVGenerator = () => {
    const BanPopup = useBanCheck(); 
    const [personalInfo, setPersonalInfo] = useState({
        name: 'Naomi Weatherford',
        title: 'Frontend Web Designer',
        about: "I'm a web designer for Fiserv, specializing in web design, graphic design, and UX. Experienced with the Adobe Creative Suite, responsive design, social media management, and prototyping.",
        phone: '123-456-7890',
        location: 'Provo, Utah',
        email: 'astronaomical@gmail.com',
        website: 'astronaomical.com'
    });

    const [workExperience, setWorkExperience] = useState([
        {
            id: '1',
            title: 'Technical Consultant',
            company: 'Fiserv',
            period: 'Apr 2018 - Now'
        }
    ]);

    const [education, setEducation] = useState([
        {
            id: '1',
            degree: 'Web Design',
            institution: 'BYU-Idaho',
            period: 'Jan. 2016 - Apr. 2018'
        }
    ]);

    const [skills, setSkills] = useState([
        { id: '1', name: 'HTML5', percent: 95 },
        { id: '2', name: 'CSS3 & SCSS', percent: 90 },
        { id: '3', name: 'JavaScript', percent: 85 },
        { id: '4', name: 'jQuery', percent: 80 }
    ]);

    const [interests] = useState(['Art', 'Books', 'Gaming']);

    return (
        <>{BanPopup}
        <div className="cv-generator p-8 bg-gray-100 min-h-screen">
            <div className="max-w-5xl mx-auto" id="contentToDownload">
                {/* Header Section */}
                <div className="bg-indigo-900 text-white p-8 rounded-t-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-500 p-2 rounded-full">
                            <i className="fas fa-rocket text-2xl"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold" contentEditable="true">
                                {personalInfo.name}
                            </h1>
                            <h2 className="text-xl opacity-90" contentEditable="true">
                                {personalInfo.title}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white p-8 rounded-b-lg shadow-lg">
                    {/* About Section */}
                    <section className="mb-8">
                        <h3 className="text-xl font-semibold mb-3 text-indigo-900">About Me</h3>
                        <p className="text-gray-700" contentEditable="true">
                            {personalInfo.about}
                        </p>
                    </section>

                    {/* Contact Section */}
                    <section className="mb-8">
                        <h3 className="text-xl font-semibold mb-3 text-indigo-900">Contact Me</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-gray-700">
                                <i className="fas fa-phone text-indigo-900"></i>
                                <span contentEditable="true">{personalInfo.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <i className="fas fa-map-marker text-indigo-900"></i>
                                <span contentEditable="true">{personalInfo.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <i className="fas fa-envelope text-indigo-900"></i>
                                <span contentEditable="true">{personalInfo.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <i className="fas fa-globe text-indigo-900"></i>
                                <span contentEditable="true">{personalInfo.website}</span>
                            </div>
                        </div>
                    </section>

                    {/* Experience Section */}
                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-semibold text-indigo-900">
                                <i className="fas fa-briefcase mr-2"></i>Experience
                            </h3>
                            <button onClick={() => setWorkExperience([...workExperience, 
                                { id: Date.now().toString(), title: 'New Position', company: 'Company Name', period: 'Start - End' }
                            ])} className="text-indigo-900 hover:text-indigo-700">
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {workExperience.map((exp) => (
                                <div key={exp.id} className="flex justify-between items-start">
                                    <div className="text-gray-700">
                                        <div className="font-semibold" contentEditable="true">{exp.title}</div>
                                        <div className="text-sm" contentEditable="true">{exp.company}</div>
                                        <div className="text-sm text-gray-500" contentEditable="true">{exp.period}</div>
                                    </div>
                                    <button onClick={() => setWorkExperience(workExperience.filter(e => e.id !== exp.id))}
                                        className="text-gray-400 hover:text-red-500">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Skills Section */}
                    <section className="mb-8">
                        <h3 className="text-xl font-semibold mb-3 text-indigo-900">
                            <i className="fas fa-code mr-2"></i>Programming Skills
                        </h3>
                        <div className="space-y-4">
                            {skills.map((skill) => (
                                <div key={skill.id} className="relative">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-700" contentEditable="true">{skill.name}</span>
                                        <span className="text-gray-500">{skill.percent}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full">
                                        <div 
                                            className="h-full bg-indigo-600 rounded-full"
                                            style={{ width: `${skill.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Interests Section */}
                    <section>
                        <h3 className="text-xl font-semibold mb-3 text-indigo-900">
                            <i className="fas fa-star mr-2"></i>Interests
                        </h3>
                        <div className="flex gap-4">
                            {interests.map((interest, index) => (
                                <div key={index} className="flex items-center gap-2 text-gray-700">
                                    <i className="fas fa-circle text-xs text-indigo-900"></i>
                                    <span contentEditable="true">{interest}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Download Button */}
            <div className="mt-8 text-center">
                <button 
                    onClick={() => {
                        const content = document.getElementById('contentToDownload');
                        html2canvas(content).then(canvas => {
                            const imgData = canvas.toDataURL('image/png');
                            const pdf = new jsPDF('p', 'mm', 'a4');
                            const pdfWidth = pdf.internal.pageSize.getWidth();
                            const pdfHeight = pdf.internal.pageSize.getHeight();
                            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                            pdf.save('my_cv.pdf');
                        });
                    }}
                    className="bg-indigo-900 text-white px-6 py-2 rounded-lg hover:bg-indigo-800 transition-colors"
                >
                    Download CV
                </button>
            </div>
        </div></>
    );
};

export default CVGenerator;