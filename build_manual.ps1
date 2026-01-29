$dest = "dist\manual_win_build"
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest -Force | Out-Null

Write-Host "Copying Electron binaries..."
Copy-Item -Path "node_modules\electron\dist\*" -Destination $dest -Recurse -Force

Write-Host "Renaming executable..."
Rename-Item -Path "$dest\electron.exe" -NewName "Employee Tracker.exe"

$appDir = "$dest\resources\app"
New-Item -ItemType Directory -Path $appDir -Force | Out-Null

Write-Host "Copying application files..."
Copy-Item "package.json" -Destination $appDir
Copy-Item "main.js" -Destination $appDir
Copy-Item "preload.js" -Destination $appDir
if (Test-Path "database.json") { Copy-Item "database.json" -Destination $appDir }

Write-Host "Copying server..."
Copy-Item "server" -Destination $appDir -Recurse

Write-Host "Copying public..."
Copy-Item "public" -Destination $appDir -Recurse

Write-Host "Copying node_modules (this may take a while)..."
Copy-Item "node_modules" -Destination $appDir -Recurse -Exclude "electron"

Write-Host "Build Complete! Located in $dest"
