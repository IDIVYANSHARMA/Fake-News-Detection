# 🍃 MongoDB Installation Guide

MongoDB is required for this MERN stack project. Follow the instructions for your operating system.

---

## 🪟 Windows

### Method 1: MongoDB Installer (Recommended)

1. **Download MongoDB Community Server**
   - Go to https://www.mongodb.com/try/download/community
   - Select "Windows" and "MSI" package
   - Click "Download"

2. **Install MongoDB**
   - Run the downloaded .msi file
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Optionally install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```cmd
   mongo --version
   ```

4. **Start MongoDB (if not running as service)**
   - Open Services (Win + R, type "services.msc")
   - Find "MongoDB Server"
   - Right-click → Start

### Method 2: MongoDB Compass

1. Download MongoDB Compass from https://www.mongodb.com/products/compass
2. Install and open Compass
3. Connect to `mongodb://localhost:27017`

---

## 🍎 macOS

### Method 1: Homebrew (Recommended)

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Tap MongoDB
brew tap mongodb/brew

# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongo --version
```

### Method 2: Manual Download

1. Download from https://www.mongodb.com/try/download/community
2. Extract to `/usr/local/mongodb`
3. Add to PATH in `~/.zshrc` or `~/.bash_profile`:
   ```bash
   export PATH="/usr/local/mongodb/bin:$PATH"
   ```
4. Create data directory:
   ```bash
   sudo mkdir -p /data/db
   sudo chown -R `id -un` /data/db
   ```
5. Start MongoDB:
   ```bash
   mongod
   ```

---

## 🐧 Linux (Ubuntu/Debian)

### Ubuntu 20.04 / 22.04

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB on boot
sudo systemctl enable mongod

# Verify
mongod --version
```

### Check MongoDB Status

```bash
sudo systemctl status mongod
```

---

## ✅ Verify Installation

After installation, verify MongoDB is running:

```bash
# Connect to MongoDB shell
mongo

# Or for newer versions:
mongosh

# You should see:
# MongoDB shell version...
# connecting to: mongodb://localhost:27017
```

---

## 🔧 MongoDB Connection String

The default connection string for local MongoDB:

```
mongodb://localhost:27017/fake-news-detection
```

This is already configured in `backend/.env`

---

## 🛠️ Common MongoDB Commands

```bash
# Start MongoDB
# Windows: Services → MongoDB Server → Start
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Stop MongoDB
# Windows: Services → MongoDB Server → Stop
# Mac: brew services stop mongodb-community
# Linux: sudo systemctl stop mongod

# Restart MongoDB
# Mac: brew services restart mongodb-community
# Linux: sudo systemctl restart mongod

# Check status
# Mac: brew services list
# Linux: sudo systemctl status mongod
```

---

## 🌐 MongoDB Compass (GUI Tool)

If you prefer a graphical interface:

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Install and open
3. Connect to: `mongodb://localhost:27017`
4. You can view your `fake-news-detection` database and collections

---

## 🐳 Using Docker (Alternative)

If you prefer using Docker:

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Stop
docker stop mongodb

# Start
docker start mongodb
```

---

## ⚠️ Troubleshooting

### "Connection refused" error

**Check if MongoDB is running:**
```bash
# Windows: Check Services
# Mac: brew services list
# Linux: sudo systemctl status mongod
```

### Port 27017 already in use

```bash
# Find process using port
# Windows: netstat -ano | findstr :27017
# Mac/Linux: lsof -ti:27017

# Kill the process
# Windows: taskkill /PID <PID> /F
# Mac/Linux: kill -9 <PID>
```

### Permission denied

```bash
# Linux: Fix permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
sudo systemctl restart mongod
```

### Can't find `mongo` command

For MongoDB 6.0+, use `mongosh` instead of `mongo`:
```bash
mongosh
```

---

## 📚 Learn More

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB University (Free courses): https://university.mongodb.com/
- MongoDB Compass Guide: https://docs.mongodb.com/compass/

---

**Once MongoDB is installed and running, you can proceed with the project setup!**
