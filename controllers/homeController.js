exports.viewInternships = (req, res) => {
  const internships = [
    { title: "Web Dev", description: "Build responsive websites", duration: "2 months" },
    { title: "AI Internship", description: "Work on ML projects", duration: "3 months" },
    { title: "Cybersecurity Intern", description: "Assist in vulnerability analysis", duration: "2 months" },
    { title: "Cloud Computing", description: "Work on AWS infrastructure", duration: "3 months" },
    { title: "Blockchain Internship", description: "Explore smart contracts", duration: "2 months" },
    { title: "App Development", description: "Build cross-platform apps", duration: "1.5 months" },
    { title: "IoT Internship", description: "Work on real-time sensor data", duration: "3 months" },
    { title: "UI/UX Design", description: "Create user-friendly interfaces", duration: "2 months" },
  ];
  res.render('categoryCards', { title: 'Internships', items: internships });
};

exports.viewJobs = (req, res) => {
  const jobs = [
    { title: "Frontend Dev", description: "React/JS Developer", location: "Bangalore" },
    { title: "Backend Dev", description: "Node.js & MongoDB", location: "Remote" },
    { title: "DevOps Engineer", description: "CI/CD pipelines", location: "Delhi" },
    { title: "QA Tester", description: "Automated and manual testing", location: "Hyderabad" },
    { title: "System Analyst", description: "Client requirement analysis", location: "Mumbai" },
    { title: "Cloud Engineer", description: "Deploying scalable solutions", location: "Remote" },
  ];
  res.render('categoryCards', { title: 'Jobs', items: jobs });
};

exports.viewCourses = (req, res) => {
  const courses = [
    { title: "Full Stack Dev", description: "MERN Stack course", duration: "6 months" },
    { title: "Data Science", description: "Python, ML, AI", duration: "4 months" },
    { title: "Cybersecurity", description: "Ethical hacking + hands-on labs", duration: "3 months" },
    { title: "UI/UX Bootcamp", description: "Figma, Wireframes", duration: "2 months" },
    { title: "DSA Mastery", description: "With C++/Java", duration: "3 months" },
    { title: "Cloud Fundamentals", description: "Azure, AWS basics", duration: "2 months" },
  ];
  res.render('categoryCards', { title: 'Courses', items: courses });
};

exports.viewCertifications = (req, res) => {
  const certs = [
    { title: "Web Dev Cert", description: "From XYZ Org", duration: "Self-paced" },
    { title: "AWS Cert", description: "Cloud Practitioner", duration: "2 months" },
    { title: "Python Certificate", description: "By Coding Ninjas", duration: "3 weeks" },
    { title: "AI & ML", description: "Coursera verified", duration: "2 months" },
    { title: "DSA in Java", description: "Self-paced coding program", duration: "3 months" },
    { title: "Digital Marketing", description: "SEO, SEM, Google Ads", duration: "1.5 months" },
  ];
  res.render('categoryCards', { title: 'Certifications', items: certs });
};