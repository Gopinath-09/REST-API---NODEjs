@echo off
START /min cmd /c "cd D:\project\training\MERN & code . & pause"
TIMEOUT 3
START /min cmd /c "cd D:\project\training\MERN\frontend & npm start & pause"
START cmd /c "cd D:\project\training\MERN\backend & npm run prod & pause"
START /min cmd /c "c: & cd C:\Users\KSRG\AppData\Local\Postman & Postman.exe"
START http://localhost:5173/
