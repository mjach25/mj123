@echo off
echo Starting GameLoot Server...
echo Please do not close this window while using the site.

:: Start the node server in the background
start /B node server.js

:: Wait for 2 seconds to let the server start
timeout /t 2 /nobreak > NUL

:: Open the browser to the local server
start http://localhost:8181/

echo Server is running! You can now use the website.
