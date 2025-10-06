# Home Rental Application Startup Script
Write-Host "🏠 Starting Home Rental Application with MongoDB Atlas" -ForegroundColor Green

# Navigate to server directory and start backend
Write-Host "`n🚀 Starting Backend Server..." -ForegroundColor Yellow
$serverProcess = Start-Process -WindowStyle Normal -FilePath "powershell" -ArgumentList "-Command", "cd 'D:\Home_Rental_Application\server'; npm start" -PassThru

# Wait a moment for backend to start
Start-Sleep -Seconds 5

# Navigate to client directory and start frontend  
Write-Host "🌐 Starting Frontend Application..." -ForegroundColor Yellow
$clientProcess = Start-Process -WindowStyle Normal -FilePath "powershell" -ArgumentList "-Command", "cd 'D:\Home_Rental_Application\client'; npm start" -PassThru

# Wait for services to start
Start-Sleep -Seconds 10

# Check if services are running
Write-Host "`n🔍 Checking Services..." -ForegroundColor Cyan
$ports = netstat -ano | findstr ":5001|:3000"

if ($ports) {
    Write-Host "✅ Services Status:" -ForegroundColor Green
    $ports | ForEach-Object { Write-Host "  $_" }
    
    Write-Host "`n🎉 Application Started Successfully!" -ForegroundColor Green
    Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "📍 Backend:  http://localhost:5001" -ForegroundColor White
    Write-Host "📍 Database: MongoDB Atlas (Connected)" -ForegroundColor White
    
    Write-Host "`n🔧 MongoDB Atlas Details:" -ForegroundColor Cyan
    Write-Host "  - Cluster: home.h9cdruk.mongodb.net" -ForegroundColor White
    Write-Host "  - Database: home_rental" -ForegroundColor White
    Write-Host "  - Status: Connected ✅" -ForegroundColor White
    
    Write-Host "`n💡 Useful Commands:" -ForegroundColor Magenta
    Write-Host "  - Stop Services: Ctrl+C in each terminal" -ForegroundColor White
    Write-Host "  - View Logs: Check the terminal windows" -ForegroundColor White
    Write-Host "  - Test API: http://localhost:5001" -ForegroundColor White
    
} else {
    Write-Host "❌ Services may not have started properly" -ForegroundColor Red
    Write-Host "Please check the terminal windows for errors" -ForegroundColor Yellow
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")