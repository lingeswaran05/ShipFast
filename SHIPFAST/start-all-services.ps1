$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Start-Svc($title, $relativePath, $command) {
  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root'; Set-Location '$relativePath'; `$Host.UI.RawUI.WindowTitle='$title'; $command"
  )
}

Start-Svc "Auth" "Backend/Authenticate" ".\mvnw.cmd spring-boot:run"
Start-Svc "Shipment" "Backend/shipment/shipment" ".\mvnw.cmd spring-boot:run"
Start-Svc "Operations" "Backend/operations/operations" ".\mvnw.cmd spring-boot:run"
Start-Svc "Admin" "Backend/admin" ".\mvnw.cmd spring-boot:run"
Start-Svc "Communications" "Backend/communications" ".\mvnw.cmd spring-boot:run"
Start-Svc "Reporting" "Backend" ".\admin\mvnw.cmd -f .\reporting\pom.xml spring-boot:run"
Start-Svc "Frontend" "." "$env:VITE_API_BASE_URL='http://localhost:8085'; $env:VITE_AUTH_BASE_URL='http://localhost:8085'; $env:VITE_SHIPMENT_BASE_URL='http://localhost:8081'; $env:VITE_OPERATIONS_BASE_URL='http://localhost:8082'; $env:VITE_ADMIN_BASE_URL='http://localhost:8083'; $env:VITE_COMM_BASE_URL='http://localhost:8086'; $env:VITE_REPORTING_BASE_URL='http://localhost:8087'; $env:VITE_ENABLE_OLD_BACKEND_FALLBACK='false'; npm run dev -- --host 0.0.0.0 --port 5173"

Write-Host "Started Auth(8085), Shipment(8081), Operations(8082), Admin(8083), Communications(8086), Reporting(8087), Frontend(5173)."
