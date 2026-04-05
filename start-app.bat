@echo off
echo Welcome to Careera!
echo.
echo Checking dependencies...
call pnpm install
echo.
echo Starting Backend and Frontend Servers...
start cmd /k "cd artifacts\api-server && set NODE_ENV=development && set PORT=3000 && pnpm run build && pnpm run start"
start cmd /k "cd artifacts\careera && set PORT=5173 && set BASE_PATH=/ && pnpm run dev"
echo.
echo Careera Platform is launching...
echo The website will be opened in your browser at http://localhost:5173/
echo Please wait 10-15 seconds for servers to fully load.
timeout /t 15 > nul
start http://localhost:5173/
pause
