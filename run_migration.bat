@echo off
echo ==============================================
echo TrustNet Architecture Restructure Script
echo ==============================================
echo.
echo Make sure ALL your servers (npm run dev, python manage.py, node server.js) are STOPPED and their terminals are CLOSED.
pause

echo Renaming platform-ui-builder to frontend...
rename "platform-ui-builder" "frontend"

echo Renaming trustnet-backend to backend...
rename "trustnet-backend" "backend"

echo Moving seed data into database folder...
move "backend\seed*.py" "database\"

echo Moving microservice otp into backend...
move "otp" "backend\otp"

echo Done! The repository now strictly follows the layout schema!
pause
