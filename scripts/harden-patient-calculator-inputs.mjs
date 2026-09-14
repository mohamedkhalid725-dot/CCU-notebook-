import fs from 'node:fs';

// Calculator inputs are intentionally kept as normal browser inputs.
// Native Android WebView/IME handling is controlled at the activity level;
// adding pointer/focus/scroll handlers here can steal focus and dismiss the
// keyboard immediately after it opens.
const path = 'src/components/patient/PatientClinicalCalculators.tsx';
if (!fs.existsSync(path)) throw new Error(`Missing ${path}`);
console.log(`Leaving ${path} inputs untouched for native Android IME compatibility.`);
