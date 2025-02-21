#!/bin/sh

# Project Name
PROJECT_NAME="main-app"

# Step 1: Create React App
echo "🚀 Creating React project: $PROJECT_NAME..."
npx create-react-app $PROJECT_NAME

# Step 2: Navigate to Project Folder
cd $PROJECT_NAME

# Step 3: Install Dependencies
echo "📦 Installing dependencies..."
npm install react-router-dom axios
# npm install -D tailwindcss postcss autoprefixer
# npx tailwindcss init -p


# Step 6: Success Message
echo "✅ Project setup complete! Run the project using:"
echo "    cd $PROJECT_NAME"
echo "    npm start"
