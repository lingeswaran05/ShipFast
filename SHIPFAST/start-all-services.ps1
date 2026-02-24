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
Start-Svc "Frontend" "." "npm run dev -- --host 0.0.0.0 --port 5173"

Write-Host "Started Auth(8085), Shipment(8081), Operations(8082), Admin(8083), Communications(8086), Reporting(8087), Frontend(5173)."
