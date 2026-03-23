const fs = require('fs');
const path = require('path');

const pagesDir = 'e:/Semester 3/Web develepment/BusMate site/BUSMATE DEV/busmate-frontend/src/pages';
if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
}

const pages = [
  'Home.jsx', 'LiveTracking.jsx', 'RoutePlanner.jsx', 'RoutesSchedules.jsx',
  'BusStopDetails.jsx', 'BusDetails.jsx', 'Alerts.jsx', 'UserDashboard.jsx',
  'Favorites.jsx', 'SmartPredictions.jsx', 'CrowdStatus.jsx', 'HelpSupport.jsx'
];

pages.forEach(page => {
    const componentName = page.replace('.jsx', '');
    const content = `import React from 'react';

const ${componentName} = () => {
    return (
        <div className="p-4 pt-20">
            <h1 className="text-2xl font-bold">${componentName}</h1>
            <p className="mt-2 text-gray-600">This is the ${componentName} page.</p>
        </div>
    );
};

export default ${componentName};
`;
    // Only write if doesn't exist
    if (!fs.existsSync(path.join(pagesDir, page))) {
        fs.writeFileSync(path.join(pagesDir, page), content);
    }
});
console.log("Pages scaffolded successfully.");
