# React App Setup

This README provides instructions for setting up a React app using Tailwind CSS and other essential dependencies.

## Frontend App Setup

### Step 1: Create the React App

Run the following command to create a new React app:
```bash
npx create-react-app App-Name
```

Replace `App-Name` with the desired name of your app.

Navigate into the newly created project directory:
```bash
cd App-Name
```

### Step 2: Initial Install Required Dependencies

### If you have package.json then just
```bash
npm install
```

Navigate to the project directory and install the following dependencies:

1. **Web Vitals**
   ```bash
   npm install web-vitals
   ```

2. **React Router DOM**
   ```bash
   npm install react-router-dom
   ```

3. **Lucide React**
   ```bash
   npm install lucide-react lucide
   ```

4. **PostCSS and Autoprefixer**
   ```bash
   npm install postcss autoprefixer
   ```

5. **Tailwind CSS**
   ```bash
   npm install tailwindcss
   ```

6. **Axios**
   ```bash
   npm install axios
   ```
Alternatively, you can install all dependencies at once using the following command:
```bash
npm install web-vitals tailwindcss postcss autoprefixer lucide-react react-router-dom lucide axios
```

### Step 3: Initialize Tailwind CSS

Run the following command to initialize Tailwind CSS:
```bash
npx tailwindcss init
```

### Step 4: Configure Tailwind CSS

Modify the `tailwind.config.js` file to ensure Tailwind scans the appropriate files. Replace the default configuration with the following:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all files in src
    "./public/index.html",        // Include the index.html file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Step 5: Start the Development Server

Start the development server:
```bash
npm start
```

### Additional Notes
- Ensure you have Node.js and npm installed on your system.
- Follow best practices for organizing your React project structure.
- For detailed documentation on using Tailwind CSS, visit the [official Tailwind CSS website](https://tailwindcss.com/docs).
