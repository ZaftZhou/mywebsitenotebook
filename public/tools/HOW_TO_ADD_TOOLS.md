# How to Add New Tools

Adding a new tool to your capabilities is a simple 2-step process.

## Step 1: Add Your Files
Place your tool's files (HTML, CSS, JS) in this directory. It is recommended to create a subfolder for each tool to keep things organized.

**Example Structure:**
```
public/
  tools/
    calculator/
      index.html
      style.css
      script.js
    weather-app/
      index.html
```

## Step 2: Register the Tool
Open `e:\WEB\mywebsitenotebook\constants.ts` and add your tool to the `TOOLS` list.

**Example Code:**
```typescript
export const TOOLS = [
    // ... existing tools
    {
        id: 'calculator',              // Unique ID
        title: 'Super Calculator',     // Display Name
        icon: '🧮',                    // Emoji Icon
        desc: 'A scientific calculator for daily use.',
        url: '/tools/calculator/index.html', // Path to your file
        color: 'bg-orange-100'         // Background color for the icon button
    }
];
```

## Style Tips
- Your tool will open in a window (iframe), so it is completely isolated from the rest of the OS.
- You can use any libraries you want inside your tool's HTML file.
- To match the OS vibe, you can use a font like `Courier New` or `Inter`.
