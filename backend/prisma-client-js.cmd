@echo off
REM Workaround for Windows spawn ENOENT issue with Prisma
REM This batch file acts as a proxy for the prisma_client_js binary

node "%~dp0node_modules\@prisma\client\generator-build\index.js" %*
