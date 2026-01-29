# 📤 How to Share the Application

Here is how you can send the Employee Tracker to someone else (another employee or manager).

---

## 📦 Step 1: Locate the Application

I have built a **portable version** for you. It is located here:

📂 **Path:** `f:\employee_tracker\dist\manual_win_build\`

Inside this folder, you will see:
- `Employee Tracker.exe` (The main app)
- `resources` (folder containing your app code)
- Other system files (dlls, etc.)

---

## 🤐 Step 2: Package it for Sending

You cannot just send the `.exe` file alone! You must send the **entire folder**.

### Option A: Use a USB Drive (Best for Offline)
1. Insert a USB drive.
2. Navigate to `f:\employee_tracker\dist\`
3. Right-click the `manual_win_build` folder.
4. Select **Copy**.
5. Go to your USB drive, right-click and **Paste**.
6. (Optional) Rename the folder on the USB to `Employee Tracker App` so it looks professional.

### Option B: Create a Zip File (Best for Email/Upload)
1. Navigate to `f:\employee_tracker\dist\`
2. Right-click the `manual_win_build` folder.
3. Select **Send to** > **Compressed (zipped) folder**.
4. A new file called `manual_win_build.zip` will appear.
5. You can rename this file to `EmployeeTracker.zip`.
6. Send this zip file via email, Google Drive, or Slack.

---

## 📥 Step 3: How the Other Person Installs It

When the other person receives the file/folder:

**If you sent a USB:**
1. They copy the folder from USB to their Desktop (or anywhere on their C: drive).
2. Open the folder.
3. Double-click **`Employee Tracker.exe`**.
4. Done! App opens.

**If you sent a Zip file:**
1. They download the zip file.
2. Right-click and select **Extract All...**
3. Open the extracted folder.
4. Double-click **`Employee Tracker.exe`**.
5. Done!

---

## ⚠️ Important Notes

1. **No Installation Needed**: This portable version runs instantly without installing Node.js or anything else.
2. **Data is Local**: Each person will have their own empty database initially. If you want them to see *your* data, you must also copy your `database.json` file into their app folder.
3. **Port Conflicts**: Ensure they don't have another app running on port 3000.

---

**You're ready to share!** 🚀
